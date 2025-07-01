import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { to, from, subject, html, text } = await request.json();

    if (!to || !subject || (!html && !text)) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: to, subject, e pelo menos html ou text' },
        { status: 400 }
      );
    }

    console.log('📧 Simulando envio de email:', {
      to,
      from: from || 'noreply@swiftedu.com',
      subject,
      timestamp: new Date().toISOString(),
    });

    const delay = Math.random() * 1000 + 500;
    await new Promise(resolve => setTimeout(resolve, delay));

    const success = Math.random() > 0.1;

    if (success) {
      console.log('✅ Email enviado com sucesso para:', to);
      return NextResponse.json({
        success: true,
        message: 'Email enviado com sucesso',
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      });
    } else {
      console.log('❌ Falha no envio de email para:', to);
      return NextResponse.json(
        { error: 'Falha temporária no serviço de email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erro na API de email:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}