# server/Dockerfile

FROM node:20-alpine

# Đặt thư mục làm việc trong container
WORKDIR /app

# Copy file package.json và package-lock.json trước
COPY package*.json ./

# Cài dependencies
RUN npm ci

# Copy toàn bộ mã nguồn vào thư mục làm việc
COPY .env
COPY . .

# Build nếu có bước build (VD: npm run build)

# Mở port backend của bạn
EXPOSE 3000

# Chạy server
CMD ["npm", "start"]
