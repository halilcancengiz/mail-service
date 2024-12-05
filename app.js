const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require('dotenv');

const app = express();
const PORT = 5000;
dotenv.config();

// Sadece belirli bir kaynaktan CORS erişimi
app.use(cors({
  origin: ["https://facebookadsagentur.de"], // İzin verilen kaynaklar
  methods: ["GET", "POST"], // İzin verilen HTTP metodları
  allowedHeaders: ["Content-Type", "Authorization"], // İzin verilen başlıklar
}));

// JSON ve URL-encoded body'leri kabul et
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Nodemailer transporter ayarları
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // STARTTLS için 587
  secure: false, // STARTTLS için secure false olmalı
  auth: {
    user: process.env.SMTP_USER, // Gmail adresiniz
    pass: process.env.SMTP_USER_PASSWORD, // Gmail App Password
  },
  tls: {
    rejectUnauthorized: false, // Sertifika hatalarını görmezden gelmek için
  },
});

// Send-Mail API
app.post("/api/send-mail", async (req, res) => {
  const data = req.body;

  // "company" için özel kontrol, diğerleri için varsayılan "Keine Angabe"
  const formattedData = {
    firstname: data.firstname?.trim() || "Keine Angabe",
    lastname: data.lastname?.trim() || "Keine Angabe",
    email: data.email?.trim() || "Keine Angabe",
    phonenumber: data.phonenumber?.trim() || "Keine Angabe",
    companyname: data.companyname?.trim() || "Kein Firmenname",
    street: data.street?.trim() || "Keine Angabe",
    zipcode: data.zipcode?.trim() || "Keine Angabe",
    location: data.location?.trim() || "Keine Angabe",
    message: data.message?.trim() || "Keine Angabe",
    pn: data.pn?.trim() || "Keine Angabe",
  };

  // Başlık formatı
  const subject = `Anfrage - Website - ${formattedData.companyname} - ${formattedData.lastname} - ${new Date().toLocaleDateString()}`;

  // İçerik formatı
  const mailTemplate = `
  <div style="color: #000000; line-height: 1.6;">
    <p style="font-weight: 700; margin: 0; color: #000000; font-size:16px;">Vorname:</p>
    <p style="margin: 0 0 10px 0; color: #000000; font-size:16px;">${formattedData.firstname}</p>

    <p style="font-weight: 700; margin: 0; color: #000000; font-size:16px;">Nachname:</p>
    <p style="margin: 0 0 10px 0; color: #000000; font-size:16px;">${formattedData.lastname}</p>

    <p style="font-weight: 700; margin: 0; color: #000000; font-size:16px;">E-Mail:</p>
    <p style="margin: 0 0 10px 0; color: #000000; font-size:16px;"><a href="mailto:${formattedData.email}" style="color: #000000; text-decoration: none;">${formattedData.email}</a></p>

    <p style="font-weight: 700; margin: 0; color: #000000; font-size:16px;">Telefonnummer:</p>
    <p style="margin: 0 0 10px 0; color: #000000; font-size:16px;">${formattedData.phonenumber}</p>

    <p style="font-weight: 700; margin: 0; color: #000000; font-size:16px;">Firma:</p>
    <p style="margin: 0 0 10px 0; color: #000000; font-size:16px;">${formattedData.companyname}</p>

    <p style="font-weight: 700; margin: 0; color: #000000; font-size:16px;">Straße, Nr.:</p>
    <p style="margin: 0 0 10px 0; color: #000000; font-size:16px;">${formattedData.street}</p>

    <p style="font-weight: 700; margin: 0; color: #000000; font-size:16px;">PLZ:</p>
    <p style="margin: 0 0 10px 0; color: #000000; font-size:16px;">${formattedData.zipcode}</p>

    <p style="font-weight: 700; margin: 0; color: #000000; font-size:16px;">Ort:</p>
    <p style="margin: 0 0 10px 0; color: #000000; font-size:16px;">${formattedData.location}</p>

    <p style="font-weight: 700; margin: 0; color: #000000; font-size:16px;">Nachricht:</p>
    <p style="margin: 0 0 10px 0; color: #000000; font-size:16px;">${formattedData.message}</p>

    <hr style="border: 1px solid #000000; margin: 20px 0;" />

    <p style="font-weight: 700; margin: 0; color: #000000; font-size:16px;">Date:</p>
    <p style="margin: 0 0 10px 0; color: #000000; font-size:16px;">${new Date().toLocaleDateString("de-DE")}</p>

    <p style="font-weight: 700; margin: 0; color: #000000; font-size:16px;">Contact Source:</p>
    <p style="margin: 0; color: #000000; font-size:16px;">${formattedData.pn}</p>
  </div>
`;


  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM, // Kendi email adresiniz
      to: process.env.SMTP_TO, // Sabit e-posta adresi
      subject: subject, // Başlık
      html: mailTemplate, // İçerik
    });

    res.status(200).send("Email was sent successfully");
  } catch (error) {
    console.error("Email sending error:", error.message); // Hata detayını yazdırır
    res.status(500).send("Email could not be sent: " + error.message); // Hata mesajını geri döner
  }
});

// Sunucuyu başlat
app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port: ${process.env.PORT}`);
});
