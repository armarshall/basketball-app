import { sendTeamInvitation } from './email_service';
import nodemailer from 'nodemailer';

// Mock nodemailer
jest.mock('nodemailer');

const mockedNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;

describe('Email Service', () => {
  let mockTransporter: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    
    // Create mock transporter
    mockTransporter = {
      sendMail: jest.fn()
    };
    
    mockedNodemailer.createTransport.mockReturnValue(mockTransporter);
    
    // Set environment variables
    process.env.EMAIL_USER = 'test@example.com';
    process.env.EMAIL_PASS = 'testpassword';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('sendTeamInvitation', () => {
    const playerEmail = 'player@test.com';
    const teamName = 'Warriors';
    const managerName = 'Coach Smith';
    const teamId = 'team123';

    it('should send invitation email successfully', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });
      
      const result = await sendTeamInvitation(playerEmail, teamName, managerName, teamId);
      
      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
    });

    it('should call sendMail with correct parameters', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });
      
      await sendTeamInvitation(playerEmail, teamName, managerName, teamId);
      
      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      
      expect(callArgs.from).toBe(process.env.EMAIL_USER);
      expect(callArgs.to).toBe(playerEmail);
      expect(callArgs.subject).toContain(teamName);
      expect(callArgs.html).toBeTruthy();
    });

    it('should include team name in email subject', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });
      
      await sendTeamInvitation(playerEmail, teamName, managerName, teamId);
      
      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      
      expect(callArgs.subject).toBe(`You've been invited to join ${teamName}!`);
    });

    it('should include manager name in email body', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });
      
      await sendTeamInvitation(playerEmail, teamName, managerName, teamId);
      
      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      
      expect(callArgs.html).toContain(managerName);
    });

    it('should include team name in email body', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });
      
      await sendTeamInvitation(playerEmail, teamName, managerName, teamId);
      
      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      
      expect(callArgs.html).toContain(teamName);
    });

    it('should include invitation link in email', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });
      
      await sendTeamInvitation(playerEmail, teamName, managerName, teamId);
      
      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      
      expect(callArgs.html).toContain('http://localhost:5173/teams');
      expect(callArgs.html).toContain('Go to Teams Page');
    });

    it('should include instructions in email body', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });
      
      await sendTeamInvitation(playerEmail, teamName, managerName, teamId);
      
      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      
      expect(callArgs.html).toContain('Log into your account');
      expect(callArgs.html).toContain('Browse Teams');
      expect(callArgs.html).toContain('Join as Player');
    });

    it('should use HTML format for email', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });
      
      await sendTeamInvitation(playerEmail, teamName, managerName, teamId);
      
      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      
      expect(callArgs.html).toBeTruthy();
      expect(callArgs.html).toContain('<div');
      expect(callArgs.html).toContain('</div>');
    });

    it('should include styling in email HTML', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });
      
      await sendTeamInvitation(playerEmail, teamName, managerName, teamId);
      
      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      
      expect(callArgs.html).toContain('style=');
      expect(callArgs.html).toContain('font-family');
      expect(callArgs.html).toContain('color');
    });

    it('should log success message', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });
      
      const consoleLogSpy = jest.spyOn(console, 'log');
      
      await sendTeamInvitation(playerEmail, teamName, managerName, teamId);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Invitation email sent to ${playerEmail}`)
      );
    });

    it('should return false on error', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('Email send failed'));
      
      const result = await sendTeamInvitation(playerEmail, teamName, managerName, teamId);
      
      expect(result).toBe(false);
    });

    it('should log error on failure', async () => {
      const error = new Error('Email send failed');
      mockTransporter.sendMail.mockRejectedValue(error);
      
      const consoleErrorSpy = jest.spyOn(console, 'error');
      
      await sendTeamInvitation(playerEmail, teamName, managerName, teamId);
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error sending invitation email:',
        error
      );
    });

    it('should handle network errors gracefully', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('ECONNREFUSED'));
      
      const result = await sendTeamInvitation(playerEmail, teamName, managerName, teamId);
      
      expect(result).toBe(false);
      expect(mockTransporter.sendMail).toHaveBeenCalled();
    });

    it('should handle authentication errors', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('Authentication failed'));
      
      const result = await sendTeamInvitation(playerEmail, teamName, managerName, teamId);
      
      expect(result).toBe(false);
    });
  });

  describe('Email Transporter Configuration', () => {
    it('should create transporter with Gmail service', () => {
      expect(mockedNodemailer.createTransport).toHaveBeenCalled();
      
      const config = mockedNodemailer.createTransport.mock.calls[0][0];
      expect(config.service).toBe('gmail');
    });

    it('should use environment variables for auth', () => {
      const config = mockedNodemailer.createTransport.mock.calls[0][0];
      
      expect(config.auth).toEqual({
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      });
    });

    it('should handle missing environment variables', () => {
      delete process.env.EMAIL_USER;
      delete process.env.EMAIL_PASS;
      
      // Re-require module to pick up new env vars
      jest.resetModules();
      
      // Should not throw error, just use undefined values
      expect(() => {
        require('./email_service');
      }).not.toThrow();
    });
  });

  describe('Email Content Validation', () => {
    beforeEach(() => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });
    });

    it('should include invitation heading', async () => {
      await sendTeamInvitation('player@test.com', 'Warriors', 'Coach', 'team1');
      
      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('Basketball Team Invitation');
    });

    it('should include invitation confirmation text', async () => {
      await sendTeamInvitation('player@test.com', 'Warriors', 'Coach', 'team1');
      
      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain("You've been invited to join a team!");
    });

    it('should include contact information note', async () => {
      await sendTeamInvitation('player@test.com', 'Warriors', 'Coach', 'team1');
      
      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('If you have any questions');
    });

    it('should include automated message disclaimer', async () => {
      await sendTeamInvitation('player@test.com', 'Warriors', 'Coach', 'team1');
      
      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('This is an automated message');
    });

    it('should have proper HTML structure', async () => {
      await sendTeamInvitation('player@test.com', 'Warriors', 'Coach', 'team1');
      
      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      const html = callArgs.html;
      
      // Check for opening and closing tags
      expect(html).toMatch(/<div[^>]*>[\s\S]*<\/div>/);
      expect(html).toMatch(/<h\d[^>]*>[\s\S]*<\/h\d>/);
    });

    it('should include clickable link button', async () => {
      await sendTeamInvitation('player@test.com', 'Warriors', 'Coach', 'team1');
      
      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toMatch(/<a[^>]*href="http:\/\/localhost:5173\/teams"[^>]*>/);
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });
    });

    it('should handle special characters in team name', async () => {
      const result = await sendTeamInvitation(
        'player@test.com',
        "Coach's Warriors & Champions",
        'Coach',
        'team1'
      );
      
      expect(result).toBe(true);
      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain("Coach's Warriors &amp; Champions");
    });

    it('should handle special characters in manager name', async () => {
      const result = await sendTeamInvitation(
        'player@test.com',
        'Warriors',
        "O'Brien",
        'team1'
      );
      
      expect(result).toBe(true);
      const callArgs = mockTransporter.sendMail.mock.calls[0][0];
      expect(callArgs.html).toContain("O'Brien");
    });

    it('should handle very long team names', async () => {
      const longTeamName = 'A'.repeat(100);
      
      const result = await sendTeamInvitation(
        'player@test.com',
        longTeamName,
        'Coach',
        'team1'
      );
      
      expect(result).toBe(true);
    });

    it('should handle empty strings gracefully', async () => {
      const result = await sendTeamInvitation('', '', '', '');
      
      expect(mockTransporter.sendMail).toHaveBeenCalled();
      // Should still attempt to send, even with empty values
    });
  });

  describe('Multiple Invitations', () => {
    beforeEach(() => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });
    });

    it('should handle multiple sequential invitations', async () => {
      await sendTeamInvitation('player1@test.com', 'Warriors', 'Coach', 'team1');
      await sendTeamInvitation('player2@test.com', 'Warriors', 'Coach', 'team1');
      await sendTeamInvitation('player3@test.com', 'Warriors', 'Coach', 'team1');
      
      expect(mockTransporter.sendMail).toHaveBeenCalledTimes(3);
    });

    it('should maintain correct data for each invitation', async () => {
      await sendTeamInvitation('player1@test.com', 'Warriors', 'Coach', 'team1');
      await sendTeamInvitation('player2@test.com', 'Lakers', 'Manager', 'team2');
      
      const call1 = mockTransporter.sendMail.mock.calls[0][0];
      const call2 = mockTransporter.sendMail.mock.calls[1][0];
      
      expect(call1.to).toBe('player1@test.com');
      expect(call1.html).toContain('Warriors');
      
      expect(call2.to).toBe('player2@test.com');
      expect(call2.html).toContain('Lakers');
    });
  });
});

