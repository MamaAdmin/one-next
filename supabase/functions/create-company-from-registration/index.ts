import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { z } from 'https://esm.sh/zod@3.23.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RegistrationSchema = z.object({
  companyName: z.string().trim().min(1).max(200),
  companySize: z.string().trim().min(1).max(50),
  address: z.string().trim().min(1).max(300),
  zipCity: z.string().trim().min(1).max(200),
  country: z.string().trim().min(1).max(100),
  contactName: z.string().trim().min(1).max(200),
  position: z.string().trim().min(1).max(200),
  email: z.string().email().max(255),
  phone: z.string().trim().min(1).max(50),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const raw = await req.json();
    const parsed = RegistrationSchema.safeParse(raw);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Invalid input' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    const data = parsed.data;

    console.log('Registration submitted for:', data.email);

    // SECURITY: Never modify existing customers or auth accounts from an
    // unauthenticated request. If the email already belongs to a known
    // customer or auth user, do not update anything, do not create/reset a
    // password, do not assign roles. The booking flow can still proceed.
    const { data: existingCustomer } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('email', data.email)
      .maybeSingle();

    if (existingCustomer) {
      return new Response(
        JSON.stringify({
          success: true,
          customerId: existingCustomer.id,
          userId: null,
          existing: true,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Check if an auth user already exists with that email (edge case)
    const { data: existingAuth } = await supabaseAdmin.auth.admin.listUsers();
    const existingAuthUser = existingAuth?.users?.find(
      (u) => u.email?.toLowerCase() === data.email.toLowerCase()
    );
    if (existingAuthUser) {
      // Do not silently attach an existing auth user to a new customer record.
      return new Response(
        JSON.stringify({ error: 'A user with this email already exists. Please sign in first.' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 409,
        }
      );
    }

    // Create new customer
    const { data: newCustomer, error: customerError } = await supabaseAdmin
      .from('customers')
      .insert({
        email: data.email,
        name: data.contactName,
        phone: data.phone,
        company_name: data.companyName,
        company_size: data.companySize,
        address: `${data.address}, ${data.zipCity}`,
        country: data.country,
        position: data.position,
      })
      .select()
      .single();

    if (customerError) throw customerError;
    const customerId = newCustomer.id;

    // Create auth user (regular user only – NO admin role from an unauthenticated endpoint)
    const tempPassword = crypto.randomUUID();
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: data.contactName,
        position: data.position,
        company_id: customerId,
      },
    });
    if (authError) throw authError;
    const userId = authUser.user.id;

    await supabaseAdmin
      .from('customers')
      .update({ primary_admin_id: userId })
      .eq('id', customerId);

    // Create participant record
    await supabaseAdmin
      .from('participants')
      .insert({
        user_id: userId,
        customer_id: customerId,
        full_name: data.contactName,
        email: data.email,
        phone: data.phone,
      });

    // NOTE: Deliberately do NOT insert into user_roles here. Elevated roles
    // (admin, content_manager, etc.) must be assigned by an authenticated
    // admin, never by an unauthenticated public registration endpoint.

    // Send password setup / recovery email
    const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: data.email,
    });
    if (resetError) console.error('Reset email error:', resetError);

    return new Response(
      JSON.stringify({ success: true, customerId, userId }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Registration failed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
