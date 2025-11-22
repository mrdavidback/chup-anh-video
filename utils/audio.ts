
// Helper function to encode Uint8Array to Base64
function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}


export const extractAndEncodeAudio = (videoFile: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (event) => {
            if (!event.target?.result) {
                return reject(new Error("Không thể đọc tệp video."));
            }

            const arrayBuffer = event.target.result as ArrayBuffer;
            
            // Use a standard AudioContext to decode the audio data
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            try {
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                // Use an OfflineAudioContext to resample the audio to 16kHz (standard for STT)
                const offlineContext = new OfflineAudioContext(
                    audioBuffer.numberOfChannels,
                    audioBuffer.duration * 16000,
                    16000
                );

                const source = offlineContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(offlineContext.destination);
                source.start();

                const resampledBuffer = await offlineContext.startRendering();

                // Convert the Float32Array to Int16Array (PCM format)
                const pcmData = resampledBuffer.getChannelData(0); // Assuming mono
                const int16Array = new Int16Array(pcmData.length);
                for (let i = 0; i < pcmData.length; i++) {
                    int16Array[i] = Math.max(-1, Math.min(1, pcmData[i])) * 32767;
                }
                
                // Encode to Base64
                const uint8Array = new Uint8Array(int16Array.buffer);
                const base64String = encode(uint8Array);

                resolve(base64String);

            } catch (err) {
                reject(new Error("Không thể giải mã dữ liệu âm thanh từ tệp video. Tệp có thể bị hỏng hoặc có định dạng không được hỗ trợ."));
            } finally {
                await audioContext.close();
            }
        };

        reader.onerror = () => {
            reject(new Error("Lỗi khi đọc tệp."));
        };

        reader.readAsArrayBuffer(videoFile);
    });
};
