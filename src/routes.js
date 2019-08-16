import index from './components/Index';
import about from './components/About';
import privacy from './components/Privacy';
import search from './components/Search';
import latest from './components/Latest';
import cource_latest from './components/CourceLatest';
import song from './components/Song';
import cource from './components/Cource';
import user from './components/User';
import oauth_service from './components/oauth/Service';
import notFound from './components/NotFound';

import contest_latest from './components/contest/ContestLatest';
import contest from './components/contest/ContestDetail';
import createContest from './components/contest/CreateContest';

export default [
    {
        path: '/',
        component: index
    },
    {
        path: '/about',
        component: about
    },
    {
        path: '/privacy',
        component: privacy
    },
    {
        path: '/search',
        component: search
    },
    {
        path: '/viewer/latest/:mode',
        component: latest
    },
    {
        path: '/viewer/cource-latest',
        component: cource_latest
    },
    {
        path: '/viewer/song/:songhash/:lnmode',
        component: song
    },
    {
        path: '/viewer/cource/:courcehash/:lnmode',
        component: cource
    },
    {
        path: '/viewer/user/:userid',
        component: user
    },
    {
        path: '/viewer/contest-latest',
        component: contest_latest
    },
    {
        path: '/viewer/contest/:contestId',
        component: contest
    },
    {
        path: '/viewer/contest-create',
        component: createContest
    },
    {
        path: '/oauth/:serviceName/:serviceToken',
        component: oauth_service
    },
    {   path: "*", 
        component: notFound 
    }
]