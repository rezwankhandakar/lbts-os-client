import React from 'react';

import { Navigate, useLocation } from 'react-router';
import useAuth from '../hooks/useAuth';

const PrivateRoute = ({children}) => {
    const {user,loading}= useAuth()
    const location = useLocation()
     if (loading){
        return <div>
            
            <span className="loading loading-bars loading-md"></span>
        </div>
     }

     if (!user){
        return <Navigate state={location.pathname} to="/login"></Navigate>
     }
    return children ;
};

export default PrivateRoute;
