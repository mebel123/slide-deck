import {getConfig} from "./config";
import {setSlidesData} from "./slides";

export async function loadSlidesBySession() {
    const sessionId = new URLSearchParams(window.location.search).get('session');

    if (sessionId) {
        slidesData = [];
        const slidesUrl = `${getConfig().SERVER_URL}/slides/${sessionId}`;
        try {
            const response = await fetch(slidesUrl);
            if (!response.ok) {
                console.error(Error('slides not found ' + slidesUrl));
            } else {
                slidesData = await response.json();
            }

        } catch (err) {
            console.error(err);
        }
    }
    setSlidesData(slidesData);
}
