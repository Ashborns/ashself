import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';
import axios from 'axios';

export default async buffer => {
    const form = new FormData();
    form.append('key', '5386e05a3562c7a8f984e73401540836');
    form.append('source', buffer, { filename: `${Date.now()}.jpg` });

    try {
        const response = await axios.post('https://imgcdn.dev/api/1/upload', form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        return response.data.image.url
    } catch (error) {
        console.error('Error uploading image:', error.response ? error.response.data : error.message);
    }
};
