export class GeminiApiKeysRotator {
	private _currentIndex: number;
	private static _instance: GeminiApiKeysRotator | null = null;

	constructor() {
		this._currentIndex = 0;
	}

	public static getInstance(): GeminiApiKeysRotator {
		if (!this._instance) {
			this._instance = new GeminiApiKeysRotator();
		}
		return this._instance;
	}

	useNextKey(): string {
		const keys = (process.env.CUSTOM_GEMINI_API_KEYS || "").split(",");
		if (keys.length === 0) {
			throw new Error("No Gemini API keys available");
		}
		this._currentIndex = (this._currentIndex + 1) % keys.length;
		return keys[this._currentIndex].trim();
	}

	setEnvNextKey(): void {
		const apiKey = this.useNextKey();
        
		// Đặt lại vào process.env.GOOGLE_API_KEY
		process.env.GOOGLE_API_KEY = apiKey;
	}
}
