import useAxiosSecure from './useAxiosSecure';

const useImageUpload = () => {
  const axiosSecure = useAxiosSecure();

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const res = await axiosSecure.post('/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return res.data.url;
  };

  return { uploadImage };
};

export default useImageUpload;