FROM amazoncorretto:24-alpine
WORKDIR /app
COPY . .

ENV JAVA_TOOL_OPTIONS="-Duser.timezone=Asia/Seoul"

RUN ./gradlew clean build --no-daemon -x test

RUN mkdir -p /app/logs/info /app/logs/error /app/logs/warn

EXPOSE 8080

CMD ["sh", "-c", "\
     java \
    -jar build/libs/application.jar"]