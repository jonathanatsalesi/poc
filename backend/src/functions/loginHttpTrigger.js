const { app } = require('@azure/functions');

app.http('login', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const location = `https://dev-f7sryk8l4taw52yj.uk.auth0.com/authorize?
        response_type=code|token&
        client_id=jO5Zggmr3izMN4azZTuv3rASheGP9LZ8&
        connection={connectionName}&
        redirect_uri=http://localhost:3000/&
        state={state}`
        const status = 302
        return { status, location }
    }
});
