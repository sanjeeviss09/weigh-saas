from database import db
if __name__ == "__main__":
    try:
        res = db.table('companies').insert({'name': 'test', 'api_key': 'test1', 'join_code': 'test'}).execute()
        print("SUCCESS:", res)
    except Exception as e:
        with open('err.txt', 'w') as f:
            f.write(str(vars(e)))
