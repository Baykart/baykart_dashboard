# BayKart Dashboard

This contains the admin dashboard for the BayKart agricultural services platform. The dashboard provides an interface for managing the platform's content, users, products, and other features.

## Application Overview

BayKart is an agricultural services platform that combines e-commerce capabilities, government scheme information, community features, market data, weather information, and farm management tools targeted at farmers. This dashboard allows administrators to manage all aspects of the platform.

## Pages Structure

The dashboard is organized into the following pages, each corresponding to a specific area of functionality:

### Index (Dashboard Home)
- **File**: `src/pages/Index.tsx`
- **Description**: Main dashboard page providing an overview of the platform's statistics, recent activities, and quick links to other sections.
- **Database Tables Used**: Multiple tables for statistics and recent activity.

### Marketplace
- **File**: `src/pages/Marketplace.tsx`
- **Description**: Manages all product-related functionality including product listings, categories, inventory, and pricing.
- **Database Tables Used**:
  - `products`: Product listing management with fields for name, category, price, stock, descriptions, and images
  - `product_ratings`: Customer reviews and ratings for products
  - `orders` & `order_items`: For order management and tracking
  - `wishlists`: Track products that users have saved to their wishlists

### Government Schemes
- **File**: `src/pages/GovernmentSchemes.tsx`
- **Description**: Manage government agricultural schemes and programs available to farmers.
- **Database Tables Used**:
  - `government_schemes`: Contains all scheme information including title, description, eligibility criteria, benefits, and required documents

### Farmers
- **File**: `src/pages/Farmers.tsx`
- **Description**: User management page for farmer profiles and accounts.
- **Database Tables Used**:
  - `users`: Main user information including contact details, location, and farm details
  - `farms`: Information about farms registered by users
  - `user_follows`: Tracks connections between users

### Crops
- **File**: `src/pages/Crops.tsx`
- **Description**: Manage crop information including varieties, growing information, and categories.
- **Database Tables Used**:
  - `crops`: Information about various crops
  - `crop_categories`: Categories for organizing crops

### CropCare
- **File**: `src/pages/CropCare.tsx`
- **Description**: Tools and resources for farm management and crop care information.
- **Database Tables Used**:
  - `farms`: For tracking farm data
  - `weather_data`: For providing weather-related crop care recommendations

### Videos
- **File**: `src/pages/Videos.tsx`
- **Description**: Manage educational and informational videos for farmers.
- **Database Tables Used**:
  - `videos`: Video content with metadata like title, description, source, and category

### Events
- **File**: `src/pages/Events.tsx`
- **Description**: Manage agricultural events, workshops, training sessions, fairs, and expos.
- **Database Tables Used**:
  - `events`: Event information including date, time, location, and registration details

### Coupons
- **File**: `src/pages/Coupons.tsx`
- **Description**: Manage promotional codes and discounts for the marketplace.
- **Database Tables Used**:
  - `coupons`: Coupon details including code, discount amount, validity period
  - `user_coupons`: Track which users have been assigned specific coupons

### Articles
- **File**: `src/pages/Articles.tsx`
- **Description**: Manage news articles and educational content.
- **Database Tables Used**:
  - `news_articles`: Article content with title, body, category, and publication information

### Community Channels
- **File**: `src/pages/CommunityChannels.tsx`
- **Description**: Manage community groups and discussion forums for farmers.
- **Database Tables Used**:
  - `community_channels`: Information about discussion groups
  - `channel_members`: Track membership of users in channels
  - `posts`: User posts within channels
  - `post_interactions`: Likes, comments, and shares on posts

### Groups
- **File**: `src/pages/Groups.tsx`
- **Description**: Alternative view or management for community groups.
- **Database Tables Used**: Same as Community Channels

### Feeds
- **File**: `src/pages/Feeds.tsx`
- **Description**: Manage content feeds and personalized recommendations for users.
- **Database Tables Used**:
  - `posts`: Community content
  - `news_articles`: News and educational content
  - Multiple tables for generating personalized feeds

### Categories
- **File**: `src/pages/Categories.tsx`
- **Description**: Manage product and content categories throughout the platform.
- **Database Tables Used**:
  - `crop_categories`: For organizing crops
  - Product categories (from products table)

### Settings
- **File**: `src/pages/Settings.tsx`
- **Description**: Dashboard configuration and system settings.
- **Database Tables Used**: Various system configuration tables

### Login
- **File**: `src/pages/Login.tsx`
- **Description**: Authentication page for dashboard access.
- **Database Tables Used**:
  - `users`: For admin authentication

### NotFound
- **File**: `src/pages/NotFound.tsx`
- **Description**: 404 error page for handling navigation to non-existent routes.

## Database Schema

The application uses a Supabase database with the following key tables:

1. **Users** - Stores user profile information
2. **Farms** - Tracks farm details for each user
3. **Products** - Catalog of products available in the marketplace
4. **Orders & Order Items** - Tracks customer purchases
5. **Government Schemes** - Information about agricultural programs
6. **Market Prices** - Current and historical crop prices
7. **Weather Data** - Weather forecasts and conditions
8. **News Articles** - Agricultural news and educational content
9. **Videos** - Educational video content
10. **Events** - Agricultural events and workshops
11. **Community Channels** - Discussion forums for farmers
12. **Posts & Post Interactions** - User-generated content and engagement
13. **Crops & Crop Categories** - Information about various crops
14. **Coupons & User Coupons** - Promotional discounts
15. **Notifications** - User alerts and messages

## Storage Buckets

The application uses the following Supabase storage buckets:

1. **profile_images** - User profile pictures
2. **product_images** - Product catalog images
3. **farm_images** - Images of farms registered by users
4. **scheme_images** - Images related to government schemes
5. **post_media** - Images and videos shared in community posts
6. **news_images** - Images used in news articles
7. **event_images** - Images for agricultural events
8. **video_thumbnails** - Thumbnail images for videos

## Security

The application implements row-level security policies to ensure data integrity and privacy:
- Users can only view and modify their own profile information
- Product information is publicly readable but only admins can modify
- Orders are only viewable by the user who created them and admins
- Community posts are publicly viewable but only creators can modify or delete
- Government scheme information is publicly readable but only admins can modify
