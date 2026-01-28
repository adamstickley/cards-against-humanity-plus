#!/bin/bash
set -e

SERVER="card-db";
PW="docker";
DB="postgres";

#echo "echo stop & remove old docker [$SERVER] and starting new fresh instance of [$SERVER]"
#(docker kill $SERVER || :) && \
#  (docker rm $SERVER || :) && \
#  docker run --name $SERVER -e POSTGRES_PASSWORD=$PW \
#  -e PGPASSWORD=$PW \
#  -p 5432:5432 \
#  -d postgres

# wait for pg to start
#echo "sleep wait for pg-server [$SERVER] to start";
#SLEEP 4;

# copy the files into the container
echo "\l" | docker exec -i $SERVER sh -c "echo games > /tmp/games.sql"
echo "\l" | docker exec -i $SERVER sh -c "echo cah_card_sets > /tmp/cah_card_sets.sql"
echo "\l" | docker exec -i $SERVER sh -c "echo cah_card_set_recommendations > /tmp/cah_card_set_recommendations.sql"
echo "\l" | docker exec -i $SERVER sh -c "echo cah_cards > /tmp/cah_cards.sql"
echo "\l" | docker cp ./bin/sql/games.sql $SERVER:/tmp/games.sql
echo "\l" | docker cp ./bin/sql/cah_card_sets.sql $SERVER:/tmp/cah_card_sets.sql
echo "\l" | docker cp ./bin/sql/cah_card_set_recommendations.sql $SERVER:/tmp/cah_card_set_recommendations.sql
echo "\l" | docker cp ./bin/sql/cah_cards.sql $SERVER:/tmp/cah_cards.sql

# create the db
echo "\l" | docker exec -i $SERVER psql -U postgres -d $DB -f /tmp/games.sql
echo "\l" | docker exec -i $SERVER psql -U postgres -d $DB -f /tmp/cah_card_sets.sql
echo "\l" | docker exec -i $SERVER psql -U postgres -d $DB -f /tmp/cah_card_set_recommendations.sql
echo "\l" | docker exec -i $SERVER psql -U postgres -d $DB -f /tmp/cah_cards.sql
