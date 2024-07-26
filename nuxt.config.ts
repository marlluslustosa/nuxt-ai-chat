// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	css: ['~/assets/css/main.css'],
	runtimeConfig: {
    		public: {
      			CHATPDF_API_KEY: process.env.NUXT_PUBLIC_CHATPDF_API_KEY,
      			CHATPDF_SOURCE_ID: process.env.NUXT_PUBLIC_CHATPDF_SOURCE_ID,
    		}
		//OPENAI_API_KEY: process.env.OPENAI_API_KEY
	},
	postcss: {
		plugins: {
			tailwindcss: {},
			autoprefixer: {}
		}
	}
});
