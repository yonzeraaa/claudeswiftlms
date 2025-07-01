import { supabase } from './supabase';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  text_content: string;
  variables: string[];
  type: 'welcome' | 'assignment' | 'grade' | 'reminder' | 'system' | 'custom';
  active: boolean;
  created_at: string;
}

export interface EmailLog {
  id: string;
  to_email: string;
  from_email: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending';
  error_message?: string;
  template_id?: string;
  metadata?: Record<string, unknown>;
  sent_at?: string;
  created_at: string;
}

export const emailService = {
  async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string,
    templateId?: string,
    metadata?: Record<string, unknown>
  ) {
    try {
      const emailData = {
        to_email: to,
        from_email: 'noreply@swiftedu.com',
        subject,
        html_content: htmlContent,
        text_content: textContent || this.htmlToText(htmlContent),
        template_id: templateId,
        metadata,
        status: 'pending' as const,
      };

      const { data: emailLog, error } = await supabase
        .from('email_logs')
        .insert(emailData)
        .select()
        .single();

      if (error) throw error;

      await this.processEmailQueue(emailLog.id);

      return emailLog as EmailLog;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  },

  async sendTemplateEmail(
    to: string,
    templateName: string,
    variables: Record<string, string> = {}
  ) {
    try {
      const { data: template, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('name', templateName)
        .eq('active', true)
        .single();

      if (error || !template) {
        throw new Error(`Template ${templateName} not found or inactive`);
      }

      let subject = template.subject;
      let htmlContent = template.html_content;
      let textContent = template.text_content;

      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        subject = subject.replace(new RegExp(placeholder, 'g'), value);
        htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
        textContent = textContent.replace(new RegExp(placeholder, 'g'), value);
      });

      return await this.sendEmail(
        to,
        subject,
        htmlContent,
        textContent,
        template.id,
        { variables, template_name: templateName }
      );
    } catch (error) {
      console.error('Error sending template email:', error);
      throw error;
    }
  },

  async processEmailQueue(emailLogId: string) {
    try {
      const { data: emailLog, error: fetchError } = await supabase
        .from('email_logs')
        .select('*')
        .eq('id', emailLogId)
        .single();

      if (fetchError || !emailLog) {
        throw new Error('Email log not found');
      }

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailLog.to_email,
          from: emailLog.from_email,
          subject: emailLog.subject,
          html: emailLog.html_content,
          text: emailLog.text_content,
        }),
      });

      if (response.ok) {
        await supabase
          .from('email_logs')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
          })
          .eq('id', emailLogId);
      } else {
        const errorData = await response.json();
        await supabase
          .from('email_logs')
          .update({
            status: 'failed',
            error_message: errorData.error || 'Unknown error',
          })
          .eq('id', emailLogId);
      }
    } catch (error) {
      console.error('Error processing email queue:', error);
      await supabase
        .from('email_logs')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
        })
        .eq('id', emailLogId);
    }
  },

  htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  },

  async getEmailLogs(limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from('email_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data as EmailLog[];
  },

  async getEmailTemplates() {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('name');

    if (error) throw error;
    return data as EmailTemplate[];
  },

  async createTemplate(template: Omit<EmailTemplate, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('email_templates')
      .insert(template)
      .select()
      .single();

    if (error) throw error;
    return data as EmailTemplate;
  },

  async updateTemplate(id: string, updates: Partial<EmailTemplate>) {
    const { data, error } = await supabase
      .from('email_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as EmailTemplate;
  },
};

export const emailTemplates = {
  welcome: {
    name: 'welcome',
    subject: 'Bem-vindo à SwiftEDU - {{student_name}}',
    html_content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #8B4513, #CD853F); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: #FFD700; margin: 0; font-size: 28px;">SwiftEDU</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Plataforma de Ensino Premium</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #8B4513; margin-top: 0;">Olá, {{student_name}}!</h2>
          
          <p style="color: #654321; line-height: 1.6;">
            Seja muito bem-vindo(a) à <strong>SwiftEDU</strong>! Estamos muito felizes em tê-lo(a) conosco em nossa plataforma de ensino premium.
          </p>
          
          <p style="color: #654321; line-height: 1.6;">
            Sua conta foi criada com sucesso e você já pode acessar todos os recursos disponíveis:
          </p>
          
          <ul style="color: #654321; line-height: 1.8; padding-left: 20px;">
            <li>Acesso aos seus cursos matriculados</li>
            <li>Acompanhamento de progresso em tempo real</li>
            <li>Certificados digitais</li>
            <li>Suporte pedagógico</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{dashboard_url}}" style="background: linear-gradient(135deg, #8B4513, #CD853F); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Acessar Dashboard
            </a>
          </div>
          
          <p style="color: #654321; line-height: 1.6; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E5E5;">
            Se você tiver qualquer dúvida, não hesite em entrar em contato conosco através do suporte integrado na plataforma.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #8B4513; font-size: 12px;">
          <p>© 2024 SwiftEDU - Todos os direitos reservados</p>
        </div>
      </div>
    `,
    text_content: `
      SwiftEDU - Bem-vindo!
      
      Olá, {{student_name}}!
      
      Seja muito bem-vindo(a) à SwiftEDU! Estamos muito felizes em tê-lo(a) conosco.
      
      Sua conta foi criada com sucesso e você já pode acessar:
      - Seus cursos matriculados
      - Acompanhamento de progresso
      - Certificados digitais
      - Suporte pedagógico
      
      Acesse seu dashboard: {{dashboard_url}}
      
      © 2024 SwiftEDU
    `,
    variables: ['student_name', 'dashboard_url'],
    type: 'welcome' as const,
    active: true,
  },

  assignmentDue: {
    name: 'assignment_due',
    subject: 'Lembrete: {{assignment_name}} - Prazo em {{days_left}} dias',
    html_content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #FF8C00, #FFD700); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">⏰ Lembrete de Prazo</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #8B4513; margin-top: 0;">Olá, {{student_name}}!</h2>
          
          <p style="color: #654321; line-height: 1.6;">
            Este é um lembrete sobre a atividade <strong>{{assignment_name}}</strong> do curso <strong>{{course_name}}</strong>.
          </p>
          
          <div style="background: #FFF8DC; border-left: 4px solid #FFD700; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #8B4513; font-weight: bold;">
              ⏱️ Prazo: {{due_date}}
            </p>
            <p style="margin: 5px 0 0 0; color: #654321;">
              Faltam apenas {{days_left}} dias para o vencimento!
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{assignment_url}}" style="background: linear-gradient(135deg, #8B4513, #CD853F); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Acessar Atividade
            </a>
          </div>
        </div>
      </div>
    `,
    text_content: `
      Lembrete de Prazo - SwiftEDU
      
      Olá, {{student_name}}!
      
      Atividade: {{assignment_name}}
      Curso: {{course_name}}
      Prazo: {{due_date}}
      
      Faltam {{days_left}} dias!
      
      Acesse: {{assignment_url}}
    `,
    variables: ['student_name', 'assignment_name', 'course_name', 'due_date', 'days_left', 'assignment_url'],
    type: 'assignment' as const,
    active: true,
  },

  gradePosted: {
    name: 'grade_posted',
    subject: 'Nova Nota Disponível - {{course_name}}',
    html_content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #228B22, #32CD32); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Nova Nota!</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #8B4513; margin-top: 0;">Parabéns, {{student_name}}!</h2>
          
          <p style="color: #654321; line-height: 1.6;">
            Sua nota para <strong>{{assignment_name}}</strong> no curso <strong>{{course_name}}</strong> já está disponível.
          </p>
          
          <div style="background: #F0FFF0; border-left: 4px solid #32CD32; padding: 15px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; color: #228B22; font-size: 24px; font-weight: bold;">
              📊 {{grade}}
            </p>
            <p style="margin: 5px 0 0 0; color: #654321;">
              {{feedback}}
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{grades_url}}" style="background: linear-gradient(135deg, #8B4513, #CD853F); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Ver Detalhes
            </a>
          </div>
        </div>
      </div>
    `,
    text_content: `
      Nova Nota - SwiftEDU
      
      Parabéns, {{student_name}}!
      
      Curso: {{course_name}}
      Atividade: {{assignment_name}}
      Nota: {{grade}}
      
      Feedback: {{feedback}}
      
      Ver detalhes: {{grades_url}}
    `,
    variables: ['student_name', 'course_name', 'assignment_name', 'grade', 'feedback', 'grades_url'],
    type: 'grade' as const,
    active: true,
  },
};

export const notificationEmailService = {
  async sendWelcomeEmail(userEmail: string, userName: string) {
    return emailService.sendTemplateEmail(userEmail, 'welcome', {
      student_name: userName,
      dashboard_url: `${process.env.NEXT_PUBLIC_SITE_URL}/student-dashboard`,
    });
  },

  async sendAssignmentDueEmail(
    userEmail: string,
    userName: string,
    assignmentName: string,
    courseName: string,
    dueDate: string,
    daysLeft: string,
    assignmentUrl: string
  ) {
    return emailService.sendTemplateEmail(userEmail, 'assignment_due', {
      student_name: userName,
      assignment_name: assignmentName,
      course_name: courseName,
      due_date: dueDate,
      days_left: daysLeft,
      assignment_url: assignmentUrl,
    });
  },

  async sendGradePostedEmail(
    userEmail: string,
    userName: string,
    courseName: string,
    assignmentName: string,
    grade: string,
    feedback: string,
    gradesUrl: string
  ) {
    return emailService.sendTemplateEmail(userEmail, 'grade_posted', {
      student_name: userName,
      course_name: courseName,
      assignment_name: assignmentName,
      grade: grade,
      feedback: feedback,
      grades_url: gradesUrl,
    });
  },
};