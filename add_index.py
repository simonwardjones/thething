import json


with open('src/thething_2017.json', 'r') as f:
    thething2017 = json.loads(f.read())
with open('src/thething_2018.json', 'r') as f:
    thething2018 = json.loads(f.read())

print('Loaded 2017 data e.g.', thething2017[0])
print('Loaded 2018 data e.g.', thething2018[0])

out = []


def add_data_out(data, year, out):
    for i, item in enumerate(data):
        item_number = i + 1
        item = {
            "id": str(year) + "_" + str(item_number),
            "year": year,
            "item_number": item_number,
            **item
        }
        if item.get("subitems", []):
            sublist = []
            for j, sub in enumerate(item["subitems"]):
                sub_item_number = j + 1
                sub = {
                    "id": str(year) + "_" + str(sub_item_number),
                    "year": year,
                    "item_number": sub_item_number,
                    **sub
                }
                sublist.append(sub)
            item["subitems"] = sublist
        out.append(item)


add_data_out(thething2017, 2017, out)
add_data_out(thething2018, 2018, out)


with open('all_thing_data.json', 'w') as f:
    f.write(json.dumps(out, indent=4))
    print(f"Written out to file {f.name} e.g. {out[0]}")

for i in out:
    print(i)






import boto3

session = boto3.Session(profile_name='simon')
# dev_s3_client = session.client('s3')
dynamodb = session.resource('dynamodb', region_name='us-east-1')

try:
    table = dynamodb.create_table(
        TableName='thething',
        KeySchema=[
            {
                'AttributeName': 'year',
                'KeyType': 'HASH'  #Partition key
            },
            {
                'AttributeName': 'item_number',
                'KeyType': 'RANGE'  #Sort key
            }
        ],
        AttributeDefinitions=[
            {
                'AttributeName': 'year',
                'AttributeType': 'N'
            },
            {
                'AttributeName': 'item_number',
                'AttributeType': 'N'
            }
        ],
        ProvisionedThroughput={
            'ReadCapacityUnits': 5,
            'WriteCapacityUnits': 5
        }
    )

    print("Table status:", table.table_status)

except Exception as e:
    print('table exists')
    table = dynamodb.Table('thething')


for item in out:
    table.put_item(Item=item)
