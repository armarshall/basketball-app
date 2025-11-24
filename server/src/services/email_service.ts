import nodemailer from 'nodemailer';

// Configure your email transporter (using Gmail as example)
const transporter = nodemailer.createTransport({  // FIXED: createTransport not createTransporter
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your app password
  },
});

export const sendTeamInvitation = async (playerEmail: string, teamName: string, managerName: string, _teamId: string) => {  // FIXED: added underscore to unused parameter
  try {
    const invitationLink = `http://localhost:5173/teams`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: playerEmail,
      subject: `You've been invited to join ${teamName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e40af; text-align: center;">Basketball Team Invitation</h2>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #1e40af;">
            <h3 style="color: #1e293b; margin-top: 0;">You've been invited to join a team!</h3>
            
            <p style="color: #475569; font-size: 16px;">
              <strong>${managerName}</strong> has invited you to join their basketball team:
            </p>
            
            <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0; text-align: center;">
              <h4 style="color: #1e40af; margin: 0; font-size: 20px;">${teamName}</h4>
            </div>
            
            <p style="color: #475569;">
              To accept this invitation and join the team, please:
            </p>
            
            <ol style="color: #475569;">
              <li>Log into your account at our basketball tournament website</li>
              <li>Go to the "Browse Teams" page</li>
              <li>Find "${teamName}" in the team list</li>
              <li>Click "Join as Player" to accept the invitation</li>
            </ol>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${invitationLink}" 
                 style="background:rgb(35, 69, 179); color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 6px; font-weight: bold;
                        display: inline-block;">
                Go to Teams Page
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 14px;">
              If you have any questions, please contact ${managerName} directly.
            </p>
            
            <p style="color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 20px;">
              This is an automated message from the Basketball Tournament System.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Invitation email sent to ${playerEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending invitation email:', error);
    return false;
  }
};