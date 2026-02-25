import React from 'react';

import { Navigate, useLocation } from 'react-router';
import useAuth from '../hooks/useAuth';
import useRole from '../hooks/useRole';
import Forbidden from '../Component/Forbidden';

const PrivateRoute = ({children}) => {
    const {user,loading}= useAuth()
    const { status, } = useRole();

     if (loading){
        return <div>
            
            <span className="loading loading-bars loading-md"></span>
        </div>
     }

     if (!user || status?.toLowerCase() !== 'approved'){
        return <Forbidden></Forbidden>
     }

    return children ;
};

export default PrivateRoute;
