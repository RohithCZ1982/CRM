# Deployment Guide for Render

This guide will help you deploy the CRM application on Render.

## Prerequisites

1. A GitHub account
2. A Render account (sign up at https://render.com)
3. Your code pushed to a GitHub repository

## Step-by-Step Deployment

### 1. Prepare Your Repository

Make sure your code is pushed to GitHub with the following structure:
```
CRM/
├── backend/
│   ├── app.py
│   └── requirements.txt
├── frontend/
│   ├── package.json
│   └── src/
├── render.yaml
└── README.md
```

### 2. Create PostgreSQL Database

1. Go to your Render dashboard
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `crm-database` (or your preferred name)
   - **Database**: `crm`
   - **User**: (auto-generated)
   - **Region**: Choose closest to your users
4. Click "Create Database"
5. **Important**: Copy the **Internal Database URL** (you'll need this for the backend)

### 3. Deploy Backend Service

1. In Render dashboard, click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `crm-backend`
   - **Region**: Same as your database
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty (or `backend` if you want)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && python app.py`
4. Add Environment Variables:
   - `DATABASE_URL`: Paste the Internal Database URL from step 2
   - `JWT_SECRET_KEY`: Generate a secure random string (you can use: `openssl rand -hex 32`)
   - `PORT`: `5000` (Render sets this automatically, but you can specify)
5. Click "Create Web Service"
6. Wait for deployment to complete
7. **Note your backend URL**: It will be something like `https://crm-backend.onrender.com`

### 4. Deploy Frontend Service

1. In Render dashboard, click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `crm-frontend`
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/build`
4. Add Environment Variable:
   - `REACT_APP_API_URL`: `https://crm-backend.onrender.com/api` (replace with your actual backend URL)
5. Click "Create Static Site"
6. Wait for deployment to complete

### 5. Update Frontend API URL (if needed)

If your backend URL changes or you need to update it:
1. Go to your frontend service in Render
2. Navigate to "Environment" tab
3. Update `REACT_APP_API_URL` with the correct backend URL
4. Redeploy the frontend

## Alternative: Using Blueprint (render.yaml)

If you prefer automated deployment:

1. Push your code with `render.yaml` to GitHub
2. In Render dashboard, click "New +" → "Blueprint"
3. Connect your repository
4. Render will automatically detect `render.yaml` and create services
5. **Important**: You still need to:
   - Create the PostgreSQL database manually
   - Set the `DATABASE_URL` environment variable in the backend service
   - Set the `REACT_APP_API_URL` environment variable in the frontend service

## Post-Deployment

### Access Your Application

1. Your frontend will be available at: `https://crm-frontend.onrender.com`
2. Your backend API will be available at: `https://crm-backend.onrender.com`

### Default Login Credentials

After first deployment, you can login with:
- **Username**: `admin`
- **Password**: `admin123`

**⚠️ IMPORTANT**: Change the default password immediately after first login!

### Verify Deployment

1. Visit your frontend URL
2. Try logging in with the default credentials
3. Create a test customer
4. Check the dashboard for statistics

## Troubleshooting

### Backend Issues

- **Database Connection Error**: Verify `DATABASE_URL` is set correctly (use Internal Database URL)
- **Port Error**: Ensure `PORT` environment variable is set to `5000` or let Render handle it automatically
- **Module Not Found**: Check that all dependencies are in `requirements.txt`

### Frontend Issues

- **API Connection Error**: Verify `REACT_APP_API_URL` points to your backend URL with `/api` suffix
- **Build Fails**: Check Node.js version compatibility (should be 16+)
- **Blank Page**: Check browser console for errors, verify API URL is correct

### Common Issues

1. **CORS Errors**: The backend has CORS enabled, but if you see CORS errors, verify the frontend URL is allowed
2. **Authentication Fails**: Check that JWT_SECRET_KEY is set and consistent
3. **Database Not Initialized**: The database should auto-initialize on first request, but you can check backend logs

## Environment Variables Summary

### Backend
- `DATABASE_URL`: PostgreSQL connection string (from Render database)
- `JWT_SECRET_KEY`: Secret key for JWT tokens (generate a secure random string)
- `PORT`: Port number (default: 5000, Render sets this automatically)

### Frontend
- `REACT_APP_API_URL`: Backend API URL (e.g., `https://crm-backend.onrender.com/api`)

## Updating Your Application

1. Make changes to your code
2. Push to GitHub
3. Render will automatically detect changes and redeploy
4. Monitor the deployment logs in Render dashboard

## Support

For Render-specific issues, check:
- Render Documentation: https://render.com/docs
- Render Status: https://status.render.com

For application issues, check the logs in Render dashboard under each service.


