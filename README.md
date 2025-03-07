# VorteKia - Project Setup

This is my Dekstop Application using Tauri React and PostgreSQL with Redis Caching for TPA Lab Assistant at Bina Nusantara University

## Setup Postgre SQL

1. Change directory to src-tauri

   ```sh
   cd src-tauri
   ```

2. Migrate existing migrations (already include with seeding)
   ```sh
   sea-orm-cli migrate up
   ```
3. Migrate fresh dropping all tables

   ```sh
   sea-orm-cli migrate fresh
   ```

4. Generate entity (model)
   ```sh
   sea-orm-cli generate entity -o entity/src/
   ```

## Setup Redis **(USE WSL)**

1. Switch to WSL Terminal (for Windows User):

   ```sh
   wsl
   ```

2. Start Redis Server:

   ```sh
   sudo service redis-server start
   ```

3. Using Redis CLI:

   ```sh
   redis-cli
   ```

   it should show the redis ip

   ```sh
   127.0.0.1:6379> ping
   PONG
   ```
