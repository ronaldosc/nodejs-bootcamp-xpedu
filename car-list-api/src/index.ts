import app from './expressApp';
import server from './graphqlServer';

(async () => {
    try {
        await server.start();

        server.applyMiddleware({ app });

        const port = process.env.PORT || 3000;
        const host = process.env.HOST || 'localhost';

        app.listen(port, () => {
            console.log(`Server running on http://${host}:${port}${server.graphqlPath}`);
        });
    } catch (error) {
        console.error('Failed to start the server:', error);
    }
})();
