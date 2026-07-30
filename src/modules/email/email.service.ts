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
    currency: string;
    receipt: string;
  }) {
    try {
      this.logger.log(`Enviando correo a ${data.email}`);
      const from = `"${this.config.getOrThrow('SMTP_FROM_NAME')}" <${this.config.getOrThrow('SMTP_FROM')}>`;
      const info = await this.transporter.sendMail({
        from,
        to: data.email,

        subject: '💜 Dulce Baby - Pago recibido correctamente',

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
    background:#f0edff;
    font-family:Arial, Helvetica, sans-serif;
">

<div style="
    max-width:650px;
    margin:auto;
    background:#ffffff;
    border-radius:20px;
    overflow:hidden;
    box-shadow:0 10px 35px rgba(79,63,177,.15);
">

    <!-- Encabezado -->
    <div style="
        background:linear-gradient(135deg,#4f3fb1,#8b89d5);
        padding:40px;
        text-align:center;
        color:white;
    ">

        <div>
            <img 
                src="cid:logo"
                alt="Dulce Baby"
                style="
                    width:90px;
                    height:90px;
                    object-fit:contain;
                    background:#ffffff;
                    border-radius:20px;
                    padding:10px;
                "
            >
        </div>


        <h1 style="
            margin:15px 0 5px;
            font-size:30px;
            color:#ffffff;
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
    <div style="
        padding:40px;
        color:#555;
    ">

        <h2 style="
            color:#4f3fb1;
            margin-top:0;
        ">
            Hola ${data.name} 💜
        </h2>


        <p style="
            font-size:16px;
            line-height:1.7;
        ">
            Nos alegra informarte que hemos recibido tu pago correctamente.
            Gracias por confiar en <strong style="color:#4f3fb1;">
            Dulce Baby
            </strong>.
        </p>


        <!-- Resumen -->
        <div style="
            background:#f6e3ec;
            border:1px solid #d0cff4;
            border-radius:15px;
            padding:25px;
            margin:30px 0;
        ">


            <h3 style="
                margin-top:0;
                color:#4f3fb1;
            ">
                Resumen de tu compra
            </h3>


            <table width="100%" style="font-size:15px;color:#555;">


                <tr>
                    <td>
                        <strong>Producto / Plan</strong>
                    </td>

                    <td align="right">
                        ${data.plan}
                    </td>
                </tr>


                <tr>

                    <td style="
                        padding-top:12px;
                    ">
                        <strong>Total pagado</strong>
                    </td>


                    <td align="right" style="
                        padding-top:12px;
                        color:#4f3fb1;
                        font-size:24px;
                        font-weight:bold;
                    ">

                        ${data.currency === 'COP'
            ? `$${data.amount.toLocaleString('es-CO')} COP`
            : `$${data.amount.toFixed(2)} USD`
          }

                    </td>

                </tr>


            </table>


        </div>



        <p style="
            line-height:1.7;
            font-size:15px;
        ">
            Puedes descargar el comprobante oficial de ePayco haciendo clic en el siguiente botón:
        </p>




        <div style="
            text-align:center;
            margin:35px 0;
        ">


            <a
                href="${data.receipt}"
                target="_blank"
                style="
                    background:#4f3fb1;
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
            border-top:1px solid #d0cff4;
            margin:35px 0;
        ">




        <p style="
            text-align:center;
            color:#8b89d5;
            line-height:1.8;
            font-size:15px;
        ">

            Gracias por confiar en nosotros 💜<br>

            Esperamos acompañarte en esta hermosa etapa.<br><br>


            <strong style="
                color:#4f3fb1;
            ">
                Dulce Baby
            </strong>

        </p>


    </div>



    <!-- Footer -->
    <div style="
        background:#e9e6f5;
        text-align:center;
        padding:18px;
        color:#8b89d5;
        font-size:13px;
    ">


        © ${new Date().getFullYear()} Dulce Baby · Todos los derechos reservados.


    </div>


</div>


</body>
</html>
`,
attachments: [
  {
    filename: 'favicon.ico',
    path: path.join(
      process.cwd(),
      'assets',
      'favicon.ico',
    ),
    cid: 'logo',
  },
],
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

      subject: `Tu guía "${data.guide}" ya está disponible 💜`,

      html: `
<!DOCTYPE html>
<html lang="es">

<head>
<meta charset="UTF-8">
<title>Guía disponible</title>
</head>


<body style="
    margin:0;
    padding:40px 20px;
    background:#f0edff;
    font-family:Arial, Helvetica, sans-serif;
">


<div style="
    max-width:650px;
    margin:auto;
    background:#ffffff;
    border-radius:20px;
    overflow:hidden;
    box-shadow:0 10px 35px rgba(79,63,177,.15);
">


<!-- Encabezado -->

<div style="
    background:linear-gradient(135deg,#4f3fb1,#8b89d5);
    padding:40px;
    text-align:center;
    color:white;
">


<img
    src="cid:logo"
    alt="Dulce Baby"
    style="
        width:90px;
        height:90px;
        object-fit:contain;
        background:#ffffff;
        border-radius:20px;
        padding:10px;
    "
>


<h1 style="
    margin:15px 0 5px;
    font-size:30px;
    color:#ffffff;
">
    Dulce Baby
</h1>


<p style="
    margin:0;
    font-size:17px;
">
    Tu guía ya está disponible 💜
</p>


</div>



<!-- Contenido -->

<div style="
    padding:40px;
    color:#555;
">


<h2 style="
    color:#4f3fb1;
    margin-top:0;
">
    Hola ${data.name} 💜
</h2>



<p style="
    font-size:16px;
    line-height:1.7;
">

Gracias por confiar en <strong style="color:#4f3fb1;">
Dulce Baby
</strong>.

Hemos preparado tu guía para acompañarte durante esta hermosa etapa.

</p>



<div style="
    background:#f6e3ec;
    border:1px solid:#d0cff4;
    border-radius:15px;
    padding:25px;
    margin:30px 0;
">


<h3 style="
    color:#4f3fb1;
    margin-top:0;
">
📘 ${data.guide}
</h3>


<p style="
    line-height:1.6;
">
Tu archivo PDF se encuentra adjunto en este correo.
</p>


</div>



<p style="
    text-align:center;
    color:#8b89d5;
    line-height:1.8;
">

Esperamos que esta guía sea de gran ayuda para ti 💜

</p>



<hr style="
    border:none;
    border-top:1px solid #d0cff4;
    margin:35px 0;
">



<p style="
    text-align:center;
    color:#8b89d5;
    font-size:15px;
">


Gracias por elegirnos.<br><br>


<strong style="color:#4f3fb1;">
Dulce Baby
</strong>


</p>


</div>



<!-- Footer -->

<div style="
    background:#e9e6f5;
    text-align:center;
    padding:18px;
    color:#8b89d5;
    font-size:13px;
">


© ${new Date().getFullYear()} Dulce Baby · Todos los derechos reservados.


</div>



</div>


</body>

</html>
`,

      attachments: [
        {
          filename: 'favicon.ico',
          path: path.join(
            process.cwd(),
            'assets',
            'favicon.ico',
          ),
          cid: 'logo',
        },

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
