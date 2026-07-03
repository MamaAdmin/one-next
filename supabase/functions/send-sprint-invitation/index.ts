import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createEvents, EventAttributes } from "https://esm.sh/ics@3.7.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TeamMember {
  name: string;
  email: string;
  role: string;
}

interface Expert {
  name: string;
  email: string;
  expertise: string;
  days: number[];
}

interface InvitationRequest {
  sessionToken: string;
  teamName: string;
  teamMembers: TeamMember[];
  experts: Expert[];
  kickoffDates: Record<number, string>;
}

const dayNames = [
  "Problem Framing",
  "Map",
  "Sketch",
  "Decide",
  "Prototype",
  "Test"
];

const createICSFile = (
  title: string,
  startDate: Date,
  description: string
): string => {
  const event: EventAttributes = {
    start: [
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      startDate.getDate(),
      startDate.getHours(),
      startDate.getMinutes(),
    ],
    duration: { hours: 3 },
    title,
    description,
    status: "CONFIRMED",
    busyStatus: "BUSY",
  };

  const { error, value } = createEvents([event]);
  
  if (error) {
    console.error("Error creating ICS file:", error);
    return "";
  }

  return value || "";
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      sessionToken,
      teamName,
      teamMembers,
      experts,
      kickoffDates,
    }: InvitationRequest = await req.json();

    console.log("Processing invitation request for team:", teamName);

    const baseUrl = "https://one-next.lovable.app";
    const dashboardUrl = `${baseUrl}/ai-design-sprint/dashboard?token=${sessionToken}`;

    // Send invitations to team members
    for (const member of teamMembers) {
      if (!member.email) continue;

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Willkommen zum AI Design Sprint!</h1>
          <p>Hallo ${member.name},</p>
          <p>Sie wurden zum <strong>${teamName}</strong> hinzugefügt.</p>
          <p>Ihre Rolle: <strong>${member.role}</strong></p>
          <p style="margin: 30px 0;">
            <a href="${dashboardUrl}" 
               style="background: linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%); 
                      color: white; 
                      padding: 12px 24px; 
                      text-decoration: none; 
                      border-radius: 6px;
                      display: inline-block;">
              Zum Sprint Dashboard
            </a>
          </p>
          <p>Der Sprint besteht aus 6 Tagen (Tag 0-5), in denen wir gemeinsam innovative Lösungen entwickeln.</p>
          ${Object.keys(kickoffDates).length > 0 ? `
            <h3>Geplante Termine:</h3>
            <ul>
              ${Object.entries(kickoffDates).map(([day, date]) => `
                <li>Tag ${day} - ${dayNames[parseInt(day)]}: ${new Date(date).toLocaleString('de-DE')}</li>
              `).join('')}
            </ul>
          ` : ''}
          <p>Wir freuen uns auf die Zusammenarbeit!</p>
          <p>Beste Grüße,<br>Ihr Sprint-Team</p>
        </div>
      `;

      const attachments = [];
      
      // Add ICS files for kickoff meetings
      for (const [day, dateStr] of Object.entries(kickoffDates)) {
        if (dateStr) {
          const icsContent = createICSFile(
            `${teamName} - Tag ${day}: ${dayNames[parseInt(day)]}`,
            new Date(dateStr),
            `AI Design Sprint - Tag ${day}\n\nTeam: ${teamName}\n\nJoin: ${dashboardUrl}`
          );
          
          if (icsContent) {
            // Convert string to Uint8Array then to base64
            const encoder = new TextEncoder();
            const data = encoder.encode(icsContent);
            const base64 = btoa(String.fromCharCode(...data));
            attachments.push({
              filename: `sprint-tag-${day}.ics`,
              content: base64,
            });
          }
        }
      }

      const { error: emailError } = await resend.emails.send({
        from: "AI Design Sprint <onboarding@resend.dev>",
        to: [member.email],
        subject: `Einladung: ${teamName} - AI Design Sprint`,
        html: emailHtml,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      if (emailError) {
        console.error(`Error sending email to ${member.email}:`, emailError);
      } else {
        console.log(`Email sent successfully to ${member.email}`);
      }
    }

    // Send invitations to experts
    for (const expert of experts) {
      if (!expert.email) continue;

      const expertDays = expert.days.map(d => `Tag ${d} - ${dayNames[d]}`).join(", ");
      const expertUrl = `${baseUrl}/ai-design-sprint/dashboard?token=${sessionToken}&role=expert`;

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Einladung als Experte zum AI Design Sprint</h1>
          <p>Hallo ${expert.name},</p>
          <p>Sie wurden als <strong>Experte</strong> für ${expert.expertise} zum <strong>${teamName}</strong> eingeladen.</p>
          <p>Ihre Teilnahme ist geplant für: <strong>${expertDays}</strong></p>
          <p style="margin: 30px 0;">
            <a href="${expertUrl}" 
               style="background: linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%); 
                      color: white; 
                      padding: 12px 24px; 
                      text-decoration: none; 
                      border-radius: 6px;
                      display: inline-block;">
              Zum Sprint Dashboard
            </a>
          </p>
          ${Object.keys(kickoffDates).length > 0 && expert.days.length > 0 ? `
            <h3>Ihre Termine:</h3>
            <ul>
              ${expert.days.map(day => kickoffDates[day] ? `
                <li>Tag ${day} - ${dayNames[day]}: ${new Date(kickoffDates[day]).toLocaleString('de-DE')}</li>
              ` : '').join('')}
            </ul>
          ` : ''}
          <p>Wir freuen uns auf Ihre Expertise!</p>
          <p>Beste Grüße,<br>Das Sprint-Team</p>
        </div>
      `;

      const attachments = [];
      
      // Add ICS files only for expert's days
      for (const day of expert.days) {
        const dateStr = kickoffDates[day];
        if (dateStr) {
          const icsContent = createICSFile(
            `${teamName} - Tag ${day}: ${dayNames[day]} (Experte)`,
            new Date(dateStr),
            `AI Design Sprint - Tag ${day}\nExperte: ${expert.expertise}\n\nTeam: ${teamName}\n\nJoin: ${expertUrl}`
          );
          
          if (icsContent) {
            // Convert string to Uint8Array then to base64
            const encoder = new TextEncoder();
            const data = encoder.encode(icsContent);
            const base64 = btoa(String.fromCharCode(...data));
            attachments.push({
              filename: `sprint-tag-${day}-expert.ics`,
              content: base64,
            });
          }
        }
      }

      const { error: emailError } = await resend.emails.send({
        from: "AI Design Sprint <onboarding@resend.dev>",
        to: [expert.email],
        subject: `Experten-Einladung: ${teamName} - AI Design Sprint`,
        html: emailHtml,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      if (emailError) {
        console.error(`Error sending email to expert ${expert.email}:`, emailError);
      } else {
        console.log(`Email sent successfully to expert ${expert.email}`);
      }
    }

    console.log("All invitations processed successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Invitations sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-sprint-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
