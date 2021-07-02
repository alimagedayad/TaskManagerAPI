const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'no-reply@mead.io',
        subject: 'Thanks for joining in!',
        text: `Welcome aboard, ${name}. Lmk how you get a along with the app`
    })
}

const goodbyeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'no-reply@mead.io',
        subject: 'Thanks for joining in!',
        text: `Sad to say you go, ${name}. Was sorta hoping that you'll stay`
    })
}

module.exports = {
    sendWelcomeEmail,
    goodbyeEmail
}

