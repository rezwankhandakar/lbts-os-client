import useAxiosSecure from './useAxiosSecure';
import { uploadImage as uploadImageShared } from '../utils/uploadImage';

/**
 * Thin wrapper — সব upload logic (validate, shrink, আসল error message)
 * utils/uploadImage.js-এ এক জায়গায় থাকে। আগে এই hook সোজা
 * axiosSecure.post করত এবং `res.data.url` না থাকলেও undefined ফেরত
 * দিত, ফলে ভাঙা photoURL DB-তে চলে যেত।
 */
const useImageUpload = () => {
  const axiosSecure = useAxiosSecure();
  const uploadImage = (file) => uploadImageShared(axiosSecure, file);
  return { uploadImage };
};

export default useImageUpload;