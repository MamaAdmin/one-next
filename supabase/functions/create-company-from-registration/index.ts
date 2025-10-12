import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RegistrationData {
  companyName: string;
  companySize: string;
  address: string;
  zipCity: string;
  country: string;
  contactName: string;
  position: string;
  email: string;
  phone: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const data: RegistrationData = await req.json();
    console.log('Creating company from registration:', data.companyName);

    // 1. Check if customer exists
    const { data: existingCustomer } = await supabaseAdmin
      .from('customers')
      .select('id, primary_admin_id')
      .eq('email', data.email)
      .maybeSingle();

    let customerId: string;
    let userId: string;

    if (existingCustomer) {
      // Update existing customer
      customerId = existingCustomer.id;
      console.log('Updating existing customer:', customerId);

      const { error: updateError } = await supabaseAdmin
        .from('customers')
        .update({
          name: data.contactName,
          phone: data.phone,
          company_name: data.companyName,
          company_size: data.companySize,
          address: `${data.address}, ${data.zipCity}`,
          country: data.country,
          position: data.position,
        })
        .eq('id', customerId);

      if (updateError) throw updateError;

      // Check if auth user exists
      if (existingCustomer.primary_admin_id) {
        userId = existingCustomer.primary_admin_id;
        console.log('Using existing admin user:', userId);
      } else {
        // Create auth user
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
        userId = authUser.user.id;
        console.log('Created new auth user:', userId);

        // Update customer with admin id
        await supabaseAdmin
          .from('customers')
          .update({ primary_admin_id: userId })
          .eq('id', customerId);
      }
    } else {
      // Create new customer
      console.log('Creating new customer');
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
      customerId = newCustomer.id;

      // Create auth user
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
      userId = authUser.user.id;
      console.log('Created new auth user:', userId);

      // Update customer with admin id
      await supabaseAdmin
        .from('customers')
        .update({ primary_admin_id: userId })
        .eq('id', customerId);
    }

    // Check if participant exists
    const { data: existingParticipant } = await supabaseAdmin
      .from('participants')
      .select('id')
      .eq('user_id', userId)
      .eq('customer_id', customerId)
      .maybeSingle();

    if (!existingParticipant) {
      // Create participant
      const { error: participantError } = await supabaseAdmin
        .from('participants')
        .insert({
          user_id: userId,
          customer_id: customerId,
          full_name: data.contactName,
          email: data.email,
          phone: data.phone,
        });

      if (participantError) throw participantError;
      console.log('Created participant');
    }

    // Check if admin role exists
    const { data: existingRole } = await supabaseAdmin
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (!existingRole) {
      // Assign admin role
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'admin',
        });

      if (roleError) throw roleError;
      console.log('Assigned admin role');
    }

    // Send password reset email
    const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: data.email,
    });

    if (resetError) {
      console.error('Reset email error:', resetError);
    } else {
      console.log('Sent password reset email');
    }

    return new Response(
      JSON.stringify({
        success: true,
        customerId,
        userId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
