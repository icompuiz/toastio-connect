module.exports = {
    host: 'isioma.prod',
    username: 'isioma.nnodum@gmail.com',
    password: 'isioma',
    documentId: '5596d9a7924ea444108e99de',
    documentName: 'emails',
    newDocument: {
        name: 'New Document',
        properties: [{
            name: 'firstName',
            value: 'Uche',
            format: 'input-text'
        }, {
            name: 'lastName',
            value: 'Tochukwu',
            format: 'input-text'
        }, {
            name: 'emailAddress',
            value: 'test@gmail.com',
            format: 'input-text'
        }, {
            name: 'phoneNumber',
            value: '2034192400',
            format: 'input-text'
        }, {
            name: 'message',
            value: 'Lorem Ipsum dolor situ satu.',
            format: 'input-richtext'
        }, {
            name: 'date',
            value: Date.now(),
            format: 'input-text'
        }],
    }
};
