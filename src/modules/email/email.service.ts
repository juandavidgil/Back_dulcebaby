import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST'),
      port: Number(this.config.get<string>('SMTP_PORT')),
      secure: false,
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASSWORD'),
      },
    });

    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.logger.log('✅ Conexión SMTP establecida correctamente.');
    } catch (error) {
      this.logger.error('❌ Error conectando con SMTP');
      console.error(error);
    }
  }

  async sendConsultationEmail(data: {
    email: string;
    name: string;
    plan: string;
    amount: number;
    receipt: string;
  }) {
    try {
      this.logger.log(`Enviando correo a ${data.email}`);
      const from = `"${this.config.getOrThrow('SMTP_FROM_NAME')}" <${this.config.getOrThrow('SMTP_FROM')}>`;
      const info = await this.transporter.sendMail({
        from,
        to: data.email,

        subject: 'Pago recibido correctamente ❤️',

        html: `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Pago recibido</title>
</head>

<body style="
    margin:0;
    padding:40px 20px;
    background:#FFF5F8;
    font-family:Arial, Helvetica, sans-serif;
">

<div style="
    max-width:650px;
    margin:auto;
    background:#ffffff;
    border-radius:20px;
    overflow:hidden;
    box-shadow:0 10px 35px rgba(0,0,0,.08);
">

    <!-- Encabezado -->
    <div style="
        background:linear-gradient(135deg,#FF8FB8,#F472B6);
        padding:40px;
        text-align:center;
        color:white;
    ">

        <div style="font-size:55px;">
            🍼👶
        </div>

        <h1 style="
            margin:10px 0 5px;
            font-size:30px;
        ">
            Dulce Baby
        </h1>

        <p style="
            margin:0;
            opacity:.95;
            font-size:17px;
        ">
            ¡Gracias por tu compra!
        </p>

    </div>

    <!-- Contenido -->
    <div style="padding:40px; color:#555;">

        <h2 style="
            color:#F472B6;
            margin-top:0;
        ">
            Hola ${data.name} 💕
        </h2>

        <p style="
            font-size:16px;
            line-height:1.7;
        ">
            Nos alegra informarte que hemos recibido tu pago correctamente.
            Gracias por confiar en <strong>Dulce Baby</strong>.
        </p>

        <!-- Resumen -->
        <div style="
            background:#FFF0F5;
            border:1px solid #FFD6E8;
            border-radius:15px;
            padding:25px;
            margin:30px 0;
        ">

            <h3 style="
                margin-top:0;
                color:#E75480;
            ">
                Resumen de tu compra
            </h3>

            <table width="100%" style="font-size:15px;">
                <tr>
                    <td><strong>Producto / Plan</strong></td>
                    <td align="right">${data.plan}</td>
                </tr>

                <tr>
                    <td style="padding-top:12px;">
                        <strong>Total pagado</strong>
                    </td>

                    <td align="right" style="
                        padding-top:12px;
                        color:#F472B6;
                        font-size:24px;
                        font-weight:bold;
                    ">
                        USD ${(data.amount / 100).toFixed(2)}
                    </td>
                </tr>
            </table>

        </div>

        <p style="
            line-height:1.7;
            font-size:15px;
        ">
            Puedes descargar el comprobante oficial de Stripe haciendo clic en el siguiente botón:
        </p>

        <div style="
            text-align:center;
            margin:35px 0;
        ">

            <a
                href="${data.receipt}"
                target="_blank"
                style="
                    background:#F472B6;
                    color:#ffffff;
                    text-decoration:none;
                    padding:16px 32px;
                    border-radius:50px;
                    display:inline-block;
                    font-size:16px;
                    font-weight:bold;
                "
            >
                📄 Descargar comprobante
            </a>

        </div>

        <hr style="
            border:none;
            border-top:1px solid #F3D4E2;
            margin:35px 0;
        ">

        <p style="
            text-align:center;
            color:#888;
            line-height:1.8;
            font-size:15px;
        ">
            Gracias por confiar en nosotros 💗<br>
            Esperamos acompañarte en esta hermosa etapa.<br><br>

            <strong style="color:#F472B6;">
                Dulce Baby
            </strong>
        </p>

    </div>

    <!-- Footer -->
    <div style="
        background:#FFF0F5;
        text-align:center;
        padding:18px;
        color:#999;
        font-size:13px;
    ">

        © ${new Date().getFullYear()} Dulce Baby · Todos los derechos reservados.

    </div>

</div>

</body>
</html>
`,
      });

      this.logger.log(`✅ Correo enviado correctamente`);

      return info;
    } catch (error) {
      this.logger.error('❌ Error enviando correo');
      console.error(error);
      throw error;
    }
  }
  async sendGuideEmail(data: {
    email: string;
    name: string;
    guide: string;
    pdfFile: string;
  }) {
    try {
      const from = `"${this.config.getOrThrow(
        'SMTP_FROM_NAME',
      )}" <${this.config.getOrThrow('SMTP_FROM')}>`;

      const pdfPath = path.join(
        process.cwd(),
        'storage',
        'guides',
        data.pdfFile,
      );

      if (!fs.existsSync(pdfPath)) {
        throw new Error(`No existe el archivo: ${pdfPath}`);
      }

      this.logger.log(`Enviando guía ${data.pdfFile} a ${data.email}`);

      const info = await this.transporter.sendMail({
        from,
        to: data.email,

        subject: `Tu guía "${data.guide}" ya está disponible 🍼`,

        html: `
      <div style="font-family:Arial;padding:40px;background:#FFF7FB">

        <h1 style="color:#F472B6">
          ¡Gracias por tu compra! 💕
        </h1>

        <p>Hola <strong>${data.name}</strong>,</p>

        <p>
          Adjuntamos la guía que acabas de adquirir.
        </p>

        <p>
          Esperamos que te ayude muchísimo en esta hermosa etapa.
        </p>

        <br>

        <strong>Dulce Baby 🍼</strong>

      </div>
      `,

        attachments: [
          {
            filename: data.pdfFile,
            path: pdfPath,
          },
        ],
      });

      this.logger.log('✅ Guía enviada correctamente');

      return info;
    } catch (error) {
      this.logger.error('❌ Error enviando guía');
      console.error(error);
      throw error;
    }
  }
}
