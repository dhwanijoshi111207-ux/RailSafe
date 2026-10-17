import requests

url = "http://127.0.0.1:5000/compare"

before_path = input("Enter full path of BEFORE photo: ").strip().strip('"')
after_path = input("Enter full path of AFTER photo: ").strip().strip('"')

try:
    with open(before_path, "rb") as before_file, \
         open(after_path, "rb") as after_file:

        response = requests.post(
            url,
            files={
                "before": before_file,
                "after": after_file
            },
            timeout=30
        )

    print("Status Code:", response.status_code)
    print("CV Result:", response.json())

except FileNotFoundError:
    print("Photo file not found. Please check the file path.")

except requests.RequestException as error:
    print("Could not connect to CV service:", error)
