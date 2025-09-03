# Next.js 프로덕션용 Dockerfile
FROM node:22-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm ci 

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=https://suclan-back-971727628700.asia-northeast3.run.app/api
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
