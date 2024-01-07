import { HashRouter, Route, Routes } from 'react-router-dom'

import { GtagRouter } from '~/components/uiParts/Gtag/gtagRouter'
import About from './about'
import Course from './course'
import CourseLatest from './courseLatest'
import Home from './home'
import Latest from './latest'
import Login from './login'
import Service from './oauth/service'
import Privacy from './privacy'
import ResetPassword from './resetPassword'
import Score from './score'
import Search from './search'
import Signup from './signup'
import Song from './song'
import User from './user'

const AppRoot = () => {
    return (
        <HashRouter>
            <GtagRouter />
            <Routes>
                <Route path="/">
                    <Route index element={<Home />} />
                </Route>
                <Route path="/about">
                    <Route index element={<About />} />
                </Route>
                <Route path="/privacy">
                    <Route index element={<Privacy />} />
                </Route>
                <Route path="/viewer/latest/:key">
                    <Route index element={<Latest />} />
                </Route>
                <Route path="/viewer/song/:songhash/:lnmode">
                    <Route index element={<Song />} />
                </Route>
                <Route path="/viewer/song/:songhash/:lnmode/score/:userId">
                    <Route index element={<Score />} />
                </Route>
                <Route path="/viewer/course-latest">
                    <Route index element={<CourseLatest />} />
                </Route>
                <Route path="/viewer/course/:coursehash/:lnmode">
                    <Route index element={<Course />} />
                </Route>

                <Route path="/login">
                    <Route index element={<Login />} />
                </Route>
                <Route path="/signup">
                    <Route index element={<Signup />} />
                </Route>
                <Route path="/reset-password">
                    <Route index element={<ResetPassword />} />
                </Route>

                <Route path="/viewer/user">
                    <Route index element={<User />} />
                </Route>
                <Route path="/viewer/user/:userId">
                    <Route index element={<User />} />
                </Route>

                <Route path="/search">
                    <Route index element={<Search />} />
                </Route>

                <Route path="/oauth/:serviceName/:serviceToken">
                    <Route index element={<Service />} />
                </Route>
            </Routes>
        </HashRouter>
    )
}

export default AppRoot
