const mailjetModule = require('node-mailjet');

const { mailjet: { publicKey, privateKey } } = require('../config');

const mailjet = mailjetModule.connect(publicKey, privateKey);

function request(recipient, link) {
  return mailjet
    .post('send', { version: 'v3.1' })
    .request({
      Messages: [
        {
          From: {
            Email: 'contact@voir-et-localiser.beta.gouv.fr',
            Name: 'Voir et localiser',
          },
          To: [
            {
              Email: recipient.email,
              Name: `${recipient.firstName} ${recipient.lastName}`,
            },
          ],
          Variables: {
            mjLink: `${link}`,
          },
          Subject: 'Voir et localiser - Confirmer votre email',
          TemplateLanguage: true,
          TextPart: "Bonjour, bienvenue sur la brique d'authentification Voir et localiser ! Vous pouvez, dès à présent, cliquer sur le lien ci-dessus pour vous connecter !",
          HTMLPart: "<h3>Bonjour, <br>bienvenue sur la brique d'authentification "
                        + "<a id='confirm-mail-link' href='{{var:mjLink}}'>Voir et localiser</a>.</h3><br>Vous pouvez, dès à présent, cliquer sur le lien ci-dessus pour vous connecter !",
        },
      ],
    });
}

module.exports = {
  request,
};
