# Backup and restore

The Docker volumes are named `mongodb_data` and `minio_data` within the Compose project. Store backups on encrypted media and test restoration regularly.

## MongoDB backup

Create the local backup directory, then run:

```sh
mkdir -p backups/mongodb
docker compose exec -T mongodb mongodump --archive --gzip --db pcfs > backups/mongodb/pcfs-$(date +%Y%m%d-%H%M%S).archive.gz
```

## MongoDB restore

Stop the website, admin and backend first. Restore into a clean or explicitly approved database:

```sh
docker compose stop website admin backend
docker compose exec -T mongodb mongorestore --archive --gzip --drop --nsInclude 'pcfs.*' < backups/mongodb/pcfs-YYYYMMDD-HHMMSS.archive.gz
docker compose start backend website admin
```

`--drop` replaces restored collections. Verify the selected backup before running it.

## Media backup

Use the MinIO client container to mirror the bucket into a local directory:

```sh
mkdir -p backups/minio
docker run --rm --network pcfs_default \
  -v "$PWD/backups/minio:/backup" \
  minio/mc sh -c 'mc alias set source http://minio:9000 pcfsminio pcfsminiochange && mc mirror source/pcfs-media /backup/pcfs-media'
```

## Media restore

```sh
docker run --rm --network pcfs_default \
  -v "$PWD/backups/minio:/backup:ro" \
  minio/mc sh -c 'mc alias set target http://minio:9000 pcfsminio pcfsminiochange && mc mirror --overwrite /backup/pcfs-media target/pcfs-media'
```

In production, replace local MinIO credentials and the Compose network with the configured environment values. After any restore, verify asset URLs, responsive variants, CMS records, public pages and one test enquiry.
