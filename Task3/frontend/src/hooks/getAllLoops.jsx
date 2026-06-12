import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { serverUrl } from '../App';

import { setLoopData } from '../redux/loopSlice';

const getAllLoops
 = () => {
    const dispatch = useDispatch();
    const {userData}=useSelector(state=>state.user) 
    useEffect(() => {
        const fetchloops = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/loop/getAll`, { withCredentials: true });
                dispatch(setLoopData(result.data));
            } catch (error) {
                console.log(error.response?.data || error.message || error);
            }
        };

        fetchloops()
    }, [userData,dispatch]);
};

export default getAllLoops;
