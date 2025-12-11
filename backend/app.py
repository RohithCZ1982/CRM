from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
# Handle PostgreSQL URL from Render (postgres:// -> postgresql://)
database_url = os.getenv('DATABASE_URL', 'sqlite:///crm.db')
if database_url.startswith('postgres://'):
    database_url = database_url.replace('postgres://', 'postgresql://', 1)
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    company = db.Column(db.String(200))
    industry = db.Column(db.String(100))
    status = db.Column(db.String(50), default='active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class Contact(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    position = db.Column(db.String(100))
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class Deal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    value = db.Column(db.Float, nullable=False)
    stage = db.Column(db.String(50), default='prospecting')
    probability = db.Column(db.Integer, default=0)
    expected_close_date = db.Column(db.Date)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class Activity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(50), nullable=False)  # call, email, meeting, note
    subject = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    due_date = db.Column(db.DateTime)
    completed = db.Column(db.Boolean, default=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'))
    deal_id = db.Column(db.Integer, db.ForeignKey('deal.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

# Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password'])
    )
    
    db.session.add(user)
    db.session.commit()
    
    access_token = create_access_token(identity=user.id)
    return jsonify({
        'access_token': access_token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email
        }
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    
    if user and check_password_hash(user.password_hash, data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }), 200
    
    return jsonify({'error': 'Invalid credentials'}), 401

# Customer Routes
@app.route('/api/customers', methods=['GET'])
@jwt_required()
def get_customers():
    user_id = get_jwt_identity()
    customers = Customer.query.filter_by(user_id=user_id).all()
    return jsonify([{
        'id': c.id,
        'name': c.name,
        'email': c.email,
        'phone': c.phone,
        'company': c.company,
        'industry': c.industry,
        'status': c.status,
        'created_at': c.created_at.isoformat(),
        'updated_at': c.updated_at.isoformat()
    } for c in customers]), 200

@app.route('/api/customers', methods=['POST'])
@jwt_required()
def create_customer():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    customer = Customer(
        name=data['name'],
        email=data.get('email'),
        phone=data.get('phone'),
        company=data.get('company'),
        industry=data.get('industry'),
        status=data.get('status', 'active'),
        user_id=user_id
    )
    
    db.session.add(customer)
    db.session.commit()
    
    return jsonify({
        'id': customer.id,
        'name': customer.name,
        'email': customer.email,
        'phone': customer.phone,
        'company': customer.company,
        'industry': customer.industry,
        'status': customer.status,
        'created_at': customer.created_at.isoformat(),
        'updated_at': customer.updated_at.isoformat()
    }), 201

@app.route('/api/customers/<int:customer_id>', methods=['PUT'])
@jwt_required()
def update_customer(customer_id):
    user_id = get_jwt_identity()
    customer = Customer.query.filter_by(id=customer_id, user_id=user_id).first()
    
    if not customer:
        return jsonify({'error': 'Customer not found'}), 404
    
    data = request.get_json()
    customer.name = data.get('name', customer.name)
    customer.email = data.get('email', customer.email)
    customer.phone = data.get('phone', customer.phone)
    customer.company = data.get('company', customer.company)
    customer.industry = data.get('industry', customer.industry)
    customer.status = data.get('status', customer.status)
    customer.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'id': customer.id,
        'name': customer.name,
        'email': customer.email,
        'phone': customer.phone,
        'company': customer.company,
        'industry': customer.industry,
        'status': customer.status,
        'created_at': customer.created_at.isoformat(),
        'updated_at': customer.updated_at.isoformat()
    }), 200

@app.route('/api/customers/<int:customer_id>', methods=['DELETE'])
@jwt_required()
def delete_customer(customer_id):
    user_id = get_jwt_identity()
    customer = Customer.query.filter_by(id=customer_id, user_id=user_id).first()
    
    if not customer:
        return jsonify({'error': 'Customer not found'}), 404
    
    db.session.delete(customer)
    db.session.commit()
    
    return jsonify({'message': 'Customer deleted'}), 200

# Contact Routes
@app.route('/api/contacts', methods=['GET'])
@jwt_required()
def get_contacts():
    user_id = get_jwt_identity()
    customer_id = request.args.get('customer_id')
    
    query = Contact.query.filter_by(user_id=user_id)
    if customer_id:
        query = query.filter_by(customer_id=customer_id)
    
    contacts = query.all()
    return jsonify([{
        'id': c.id,
        'first_name': c.first_name,
        'last_name': c.last_name,
        'email': c.email,
        'phone': c.phone,
        'position': c.position,
        'customer_id': c.customer_id,
        'created_at': c.created_at.isoformat(),
        'updated_at': c.updated_at.isoformat()
    } for c in contacts]), 200

@app.route('/api/contacts', methods=['POST'])
@jwt_required()
def create_contact():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    contact = Contact(
        first_name=data['first_name'],
        last_name=data['last_name'],
        email=data.get('email'),
        phone=data.get('phone'),
        position=data.get('position'),
        customer_id=data['customer_id'],
        user_id=user_id
    )
    
    db.session.add(contact)
    db.session.commit()
    
    return jsonify({
        'id': contact.id,
        'first_name': contact.first_name,
        'last_name': contact.last_name,
        'email': contact.email,
        'phone': contact.phone,
        'position': contact.position,
        'customer_id': contact.customer_id,
        'created_at': contact.created_at.isoformat(),
        'updated_at': contact.updated_at.isoformat()
    }), 201

@app.route('/api/contacts/<int:contact_id>', methods=['PUT'])
@jwt_required()
def update_contact(contact_id):
    user_id = get_jwt_identity()
    contact = Contact.query.filter_by(id=contact_id, user_id=user_id).first()
    
    if not contact:
        return jsonify({'error': 'Contact not found'}), 404
    
    data = request.get_json()
    contact.first_name = data.get('first_name', contact.first_name)
    contact.last_name = data.get('last_name', contact.last_name)
    contact.email = data.get('email', contact.email)
    contact.phone = data.get('phone', contact.phone)
    contact.position = data.get('position', contact.position)
    contact.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'id': contact.id,
        'first_name': contact.first_name,
        'last_name': contact.last_name,
        'email': contact.email,
        'phone': contact.phone,
        'position': contact.position,
        'customer_id': contact.customer_id,
        'created_at': contact.created_at.isoformat(),
        'updated_at': contact.updated_at.isoformat()
    }), 200

@app.route('/api/contacts/<int:contact_id>', methods=['DELETE'])
@jwt_required()
def delete_contact(contact_id):
    user_id = get_jwt_identity()
    contact = Contact.query.filter_by(id=contact_id, user_id=user_id).first()
    
    if not contact:
        return jsonify({'error': 'Contact not found'}), 404
    
    db.session.delete(contact)
    db.session.commit()
    
    return jsonify({'message': 'Contact deleted'}), 200

# Deal Routes
@app.route('/api/deals', methods=['GET'])
@jwt_required()
def get_deals():
    user_id = get_jwt_identity()
    deals = Deal.query.filter_by(user_id=user_id).all()
    return jsonify([{
        'id': d.id,
        'title': d.title,
        'value': d.value,
        'stage': d.stage,
        'probability': d.probability,
        'expected_close_date': d.expected_close_date.isoformat() if d.expected_close_date else None,
        'customer_id': d.customer_id,
        'created_at': d.created_at.isoformat(),
        'updated_at': d.updated_at.isoformat()
    } for d in deals]), 200

@app.route('/api/deals', methods=['POST'])
@jwt_required()
def create_deal():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    deal = Deal(
        title=data['title'],
        value=data['value'],
        stage=data.get('stage', 'prospecting'),
        probability=data.get('probability', 0),
        expected_close_date=datetime.strptime(data['expected_close_date'], '%Y-%m-%d').date() if data.get('expected_close_date') else None,
        customer_id=data['customer_id'],
        user_id=user_id
    )
    
    db.session.add(deal)
    db.session.commit()
    
    return jsonify({
        'id': deal.id,
        'title': deal.title,
        'value': deal.value,
        'stage': deal.stage,
        'probability': deal.probability,
        'expected_close_date': deal.expected_close_date.isoformat() if deal.expected_close_date else None,
        'customer_id': deal.customer_id,
        'created_at': deal.created_at.isoformat(),
        'updated_at': deal.updated_at.isoformat()
    }), 201

@app.route('/api/deals/<int:deal_id>', methods=['PUT'])
@jwt_required()
def update_deal(deal_id):
    user_id = get_jwt_identity()
    deal = Deal.query.filter_by(id=deal_id, user_id=user_id).first()
    
    if not deal:
        return jsonify({'error': 'Deal not found'}), 404
    
    data = request.get_json()
    deal.title = data.get('title', deal.title)
    deal.value = data.get('value', deal.value)
    deal.stage = data.get('stage', deal.stage)
    deal.probability = data.get('probability', deal.probability)
    if data.get('expected_close_date'):
        deal.expected_close_date = datetime.strptime(data['expected_close_date'], '%Y-%m-%d').date()
    deal.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'id': deal.id,
        'title': deal.title,
        'value': deal.value,
        'stage': deal.stage,
        'probability': deal.probability,
        'expected_close_date': deal.expected_close_date.isoformat() if deal.expected_close_date else None,
        'customer_id': deal.customer_id,
        'created_at': deal.created_at.isoformat(),
        'updated_at': deal.updated_at.isoformat()
    }), 200

@app.route('/api/deals/<int:deal_id>', methods=['DELETE'])
@jwt_required()
def delete_deal(deal_id):
    user_id = get_jwt_identity()
    deal = Deal.query.filter_by(id=deal_id, user_id=user_id).first()
    
    if not deal:
        return jsonify({'error': 'Deal not found'}), 404
    
    db.session.delete(deal)
    db.session.commit()
    
    return jsonify({'message': 'Deal deleted'}), 200

# Activity Routes
@app.route('/api/activities', methods=['GET'])
@jwt_required()
def get_activities():
    user_id = get_jwt_identity()
    customer_id = request.args.get('customer_id')
    deal_id = request.args.get('deal_id')
    
    query = Activity.query.filter_by(user_id=user_id)
    if customer_id:
        query = query.filter_by(customer_id=customer_id)
    if deal_id:
        query = query.filter_by(deal_id=deal_id)
    
    activities = query.all()
    return jsonify([{
        'id': a.id,
        'type': a.type,
        'subject': a.subject,
        'description': a.description,
        'due_date': a.due_date.isoformat() if a.due_date else None,
        'completed': a.completed,
        'customer_id': a.customer_id,
        'deal_id': a.deal_id,
        'created_at': a.created_at.isoformat(),
        'updated_at': a.updated_at.isoformat()
    } for a in activities]), 200

@app.route('/api/activities', methods=['POST'])
@jwt_required()
def create_activity():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    activity = Activity(
        type=data['type'],
        subject=data['subject'],
        description=data.get('description'),
        due_date=datetime.fromisoformat(data['due_date'].replace('Z', '+00:00')) if data.get('due_date') else None,
        completed=data.get('completed', False),
        customer_id=data.get('customer_id'),
        deal_id=data.get('deal_id'),
        user_id=user_id
    )
    
    db.session.add(activity)
    db.session.commit()
    
    return jsonify({
        'id': activity.id,
        'type': activity.type,
        'subject': activity.subject,
        'description': activity.description,
        'due_date': activity.due_date.isoformat() if activity.due_date else None,
        'completed': activity.completed,
        'customer_id': activity.customer_id,
        'deal_id': activity.deal_id,
        'created_at': activity.created_at.isoformat(),
        'updated_at': activity.updated_at.isoformat()
    }), 201

@app.route('/api/activities/<int:activity_id>', methods=['PUT'])
@jwt_required()
def update_activity(activity_id):
    user_id = get_jwt_identity()
    activity = Activity.query.filter_by(id=activity_id, user_id=user_id).first()
    
    if not activity:
        return jsonify({'error': 'Activity not found'}), 404
    
    data = request.get_json()
    activity.type = data.get('type', activity.type)
    activity.subject = data.get('subject', activity.subject)
    activity.description = data.get('description', activity.description)
    if data.get('due_date'):
        activity.due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
    activity.completed = data.get('completed', activity.completed)
    activity.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'id': activity.id,
        'type': activity.type,
        'subject': activity.subject,
        'description': activity.description,
        'due_date': activity.due_date.isoformat() if activity.due_date else None,
        'completed': activity.completed,
        'customer_id': activity.customer_id,
        'deal_id': activity.deal_id,
        'created_at': activity.created_at.isoformat(),
        'updated_at': activity.updated_at.isoformat()
    }), 200

@app.route('/api/activities/<int:activity_id>', methods=['DELETE'])
@jwt_required()
def delete_activity(activity_id):
    user_id = get_jwt_identity()
    activity = Activity.query.filter_by(id=activity_id, user_id=user_id).first()
    
    if not activity:
        return jsonify({'error': 'Activity not found'}), 404
    
    db.session.delete(activity)
    db.session.commit()
    
    return jsonify({'message': 'Activity deleted'}), 200

# Health Check
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

# Dashboard Stats
@app.route('/api/dashboard/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    user_id = get_jwt_identity()
    
    total_customers = Customer.query.filter_by(user_id=user_id).count()
    active_customers = Customer.query.filter_by(user_id=user_id, status='active').count()
    total_deals = Deal.query.filter_by(user_id=user_id).count()
    total_deal_value = db.session.query(db.func.sum(Deal.value)).filter_by(user_id=user_id).scalar() or 0
    
    deals_by_stage = db.session.query(
        Deal.stage,
        db.func.count(Deal.id),
        db.func.sum(Deal.value)
    ).filter_by(user_id=user_id).group_by(Deal.stage).all()
    
    return jsonify({
        'total_customers': total_customers,
        'active_customers': active_customers,
        'total_deals': total_deals,
        'total_deal_value': float(total_deal_value),
        'deals_by_stage': [{'stage': s[0], 'count': s[1], 'value': float(s[2] or 0)} for s in deals_by_stage]
    }), 200

# Initialize database
def init_db():
    with app.app_context():
        db.create_all()
        
        # Create default admin user if it doesn't exist
        if not User.query.filter_by(username='admin').first():
            admin = User(
                username='admin',
                email='admin@crm.com',
                password_hash=generate_password_hash('admin123')
            )
            db.session.add(admin)
            db.session.commit()

if __name__ == '__main__':
    init_db()
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
else:
    # Initialize database when running as a module (e.g., on Render)
    init_db()

