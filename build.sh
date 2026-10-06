#!/usr/bin/env bash

set -o errexit

pip install -r requirements.txt

python manage.py migrate

python manage.py search_index --rebuild -f

python manage.py collectstatic --no-input

python manage.py create_admin