users list: (For simplicity, all have password "admin")
=> testuser@test.com (admin)
=> testuser1@test.com
=> testuser2@test.com

APIs list: 
=> /login POST {email,password}
=> /check-api GET
=> /revoke-api POST {email} (admin accessible api)