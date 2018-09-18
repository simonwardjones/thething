import boto3
import json
import decimal
session = boto3.Session(profile_name='simon')
# dev_s3_client = session.client('s3')
dynamodb = session.resource('dynamodb', region_name='us-east-1')

table = dynamodb.Table('thething')


# Helper class to convert a DynamoDB item to JSON.
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            if o % 1 > 0:
                return float(o)
            else:
                return int(o)
        return super(DecimalEncoder, self).default(o)


print(json.dumps(table.scan()["Items"], indent=2, cls=DecimalEncoder))
