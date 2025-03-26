import {getConfig} from "./config";
import {setSlidesData} from "./slides";

export async function loadSlidesBySession() {
    const sessionId = new URLSearchParams(window.location.search).get('session');
    if (sessionId) {
        const slidesUrl = `${getConfig().SERVER_URL}/slides/${sessionId}`;
        try {
            const response = await fetch(slidesUrl);
            if (!response.ok) {
                console.error(Error('slides not found ' + slidesUrl));
            } else {
                const slidesData = await response.json();
                setSlidesData(slidesData);
            }
        } catch (err) {
            console.error(err);
        }
    }

}
