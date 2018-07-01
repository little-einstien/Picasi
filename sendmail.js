var Sendgrid = require('sendgrid')(
  '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'
);

var request = Sendgrid.emptyRequest({
  method: 'POST',
  path: '/v3/mail/send',
  body: {
    personalizations: [
      {
        to: [{email: 'einstien0001@gmail.com'},{email: 'arnavsimer@ymail.com.com'}],
        subject: 'Sendgrid test email from Node.js on Google Cloud Platform',
      },
    ],
    from: {email: 'from_email@example.com'},
    content: [
      {
        type: 'text/plain',
        value:
          'Hello!\n\nThis a Sendgrid test email from Node.js on Google Cloud Platform.',
      },
    ],
  },
});

Sendgrid.API(request, function(error, response) {
  if (error) {
    console.log('Mail not sent; see error message below.');
  } else {
    console.log('Mail sent successfully!');
  }
  console.log(response);
});
