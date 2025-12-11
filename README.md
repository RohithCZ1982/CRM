# CRM Application

A complete Customer Relationship Management (CRM) system built with React.js frontend and Python Flask backend, designed to be deployed on Render.

## Features

- **User Authentication**: Register and login with JWT-based authentication
- **Customer Management**: Create, read, update, and delete customers
- **Contact Management**: Manage contacts associated with customers
- **Deal Tracking**: Track deals through various stages (prospecting, qualification, proposal, negotiation, closed)
- **Activity Management**: Log and track activities (calls, emails, meetings, notes)
- **Dashboard**: View key metrics and statistics
- **Responsive Design**: Modern, mobile-friendly UI

## Tech Stack

### Frontend
- React.js 18
- React Router DOM
- Axios for API calls
- Modern CSS with responsive design

### Backend
- Python 3
- Flask
- Flask-SQLAlchemy (database ORM)
- Flask-JWT-Extended (authentication)
- Flask-CORS (CORS support)
- PostgreSQL (production) / SQLite (development)

## Project Structure

```
CRM/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── requirements.txt    # Python dependencies
│   └── .gitignore
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React context (Auth)
│   │   ├── services/       # API service
│   │   └── App.js
│   ├── package.json
│   └── .gitignore
├── render.yaml            # Render deployment configuration
└── README.md
```

## Local Development

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the backend directory:
```env
DATABASE_URL=sqlite:///crm.db
JWT_SECRET_KEY=your-secret-key-change-in-production
PORT=5000
```

5. Run the backend:
```bash
python app.py
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Run the frontend:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Deployment on Render

### Prerequisites
- A Render account
- A PostgreSQL database (Render provides this)

### Step 1: Deploy Backend

1. Go to your Render dashboard and create a new **Web Service**
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `crm-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && python app.py`
   - **Environment Variables**:
     - `DATABASE_URL`: Your PostgreSQL database URL (from Render PostgreSQL service)
     - `JWT_SECRET_KEY`: Generate a secure random string
     - `PORT`: `5000` (Render sets this automatically, but you can specify)

4. Deploy the service

### Step 2: Create PostgreSQL Database

1. In Render dashboard, create a new **PostgreSQL** database
2. Copy the **Internal Database URL** (for backend) and **External Database URL** (if needed)
3. Use the Internal Database URL in your backend environment variables

### Step 3: Deploy Frontend

1. Create a new **Static Site** in Render
2. Connect your GitHub repository
3. Configure:
   - **Name**: `crm-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/build`
   - **Environment Variables**:
     - `REACT_APP_API_URL`: Your backend service URL (e.g., `https://crm-backend.onrender.com/api`)

4. Deploy the service

### Alternative: Using render.yaml

You can also use the provided `render.yaml` file for automated deployment:

1. Push your code to GitHub
2. In Render dashboard, select "New" → "Blueprint"
3. Connect your repository
4. Render will automatically detect and use the `render.yaml` file

## Default Credentials

After first deployment, a default admin user is created:
- **Username**: `admin`
- **Password**: `admin123`

**Important**: Change the default password after first login in production!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create a customer
- `PUT /api/customers/<id>` - Update a customer
- `DELETE /api/customers/<id>` - Delete a customer

### Contacts
- `GET /api/contacts` - Get all contacts
- `POST /api/contacts` - Create a contact
- `PUT /api/contacts/<id>` - Update a contact
- `DELETE /api/contacts/<id>` - Delete a contact

### Deals
- `GET /api/deals` - Get all deals
- `POST /api/deals` - Create a deal
- `PUT /api/deals/<id>` - Update a deal
- `DELETE /api/deals/<id>` - Delete a deal

### Activities
- `GET /api/activities` - Get all activities
- `POST /api/activities` - Create an activity
- `PUT /api/activities/<id>` - Update an activity
- `DELETE /api/activities/<id>` - Delete an activity

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

All endpoints (except auth) require JWT authentication via the `Authorization: Bearer <token>` header.

## Environment Variables

### Backend
- `DATABASE_URL`: Database connection string
- `JWT_SECRET_KEY`: Secret key for JWT token signing
- `PORT`: Port number (default: 5000)

### Frontend
- `REACT_APP_API_URL`: Backend API URL

## Security Notes

- Change the default admin password immediately
- Use a strong `JWT_SECRET_KEY` in production
- Ensure HTTPS is enabled in production
- Regularly update dependencies for security patches

## License

This project is open source and available under the MIT License.


