import Layout from '@/app/components/layout';
import '@/app/styles/globals.css';

const MyApp = ({ Component, pageProps }) => {
    return (
        <Layout>
            <Component {...pageProps} />
        </Layout>
    );
};

export default MyApp;
