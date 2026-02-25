Myjob
# get all products
GET /api/products (có phân trang)
GET /api/products?page=1&limit=10 
# tìm kiếm sản phẩm
GET /api/products/search
# get product by id
GET /api/products/:id
# filter category
GET /api/products?categoryId=2
# filter price
GET /api/products?minPrice=2&maxPrice=2
# filter rating
GET /api/products?minRating=2&maxRating=2
# filter stock
GET /api/products?minStock=2&maxStock=2
# filter sort
GET /api/products?sort=price_asc
# filter category, price, rating, stock, sort
GET /api/products?categoryId=2&minPrice=2&maxPrice=2&minRating=2&maxRating=2&minStock=2&maxStock=2&sort=price_asc
# sắp xếp theo giá
GET /api/products?sort=price_asc
# sắp xếp theo giá giảm dần
GET /api/products?sort=price_desc
# sắp xếp theo rating
GET /api/products?sort=rating_asc
# sắp xếp theo rating giảm dần
GET /api/products?sort=rating_desc
# sắp xếp theo stock
GET /api/products?sort=stock_asc
# sắp xếp theo stock giảm dần
GET /api/products?sort=stock_desc
# thêm sản phẩm
POST /api/products
# update sản phẩm
PATCH /api/products/:id
PUT /api/products/:id
# delete sản phẩm
DELETE /api/products/:id


# đánh giá sản phẩm
POST /api/products/:id/reviews
# update review
PUT /api/reviews/:id
# delete review
DELETE /api/reviews/:id
# get reviews by product
GET /api/products/:id/reviews
# get all categories
GET /api/categories
# get category by id
GET /api/categories/:id
# add category
POST /api/categories
# update category
PUT /api/categories/:id
# delete category
DELETE /api/categories/:id
# AI tư vấn
POST /api/ai/recommend
GET  /api/ai/recommend/by-product/{id}
GET  /api/ai/recommend/by-user/{id}