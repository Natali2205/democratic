from bson import ObjectId
from flask import Blueprint, request, \
    render_template, flash, jsonify, session, redirect
from database import DB
from models.user import User
from models.withdrawn_stuff import WithdrawnStuff

m_bp = Blueprint('m_bp', __name__)


@m_bp.route('/resources', methods=['GET', 'POST'])
def main_r():
    return jsonify({'ok': 'ok'})


@m_bp.route('/', methods=['GET', 'POST'])
def main():
    w_stuffs = WithdrawnStuff().get_withdrawn_stuffs()
    return render_template('democratic/index.html', w_stuffs=w_stuffs)


@m_bp.route('/create_new', methods=['POST'])
def create_user():
    w_stuffs = WithdrawnStuff().get_withdrawn_stuffs()
    user = {
        'first_name': request.values.get('first_name'),
        'last_name': request.values.get('last_name'),
        'birth_date': request.values.get('birth_date'),
        'marital_relationship': request.values.get('marital_relationship'),
        'address': request.values.get('address'),
        'phone': request.values.get('phone'),
        'height': request.values.get('height'),
        'eye_color': request.values.get('eye_color'),
        'withdrawn_stuff': request.values.get('withdrawn_stuff'),
        'status': request.values.get('status')
    }
    result = User().insert_data(user)
    if result:
        flash('Congratulation, you crossed the border!')
    else:
        flash('Sorry, something went wrong!')
    return render_template('democratic/index.html', w_stuffs=w_stuffs)


@m_bp.route('/list_lasts', methods=['GET'])
def get_last_users_list():
    w_stuffs = WithdrawnStuff().get_withdrawn_stuffs()
    users = list(DB.find(collection="users").limit(10))
    return render_template('democratic/index.html', users=users,
                           w_stuffs=w_stuffs)


@m_bp.route('/get_user/<id>', methods=['GET'])
def get_user(id):
    w_stuffs = WithdrawnStuff().get_withdrawn_stuffs()
    user = DB.find_one("users", {'_id': ObjectId(id)})
    return render_template('democratic/index.html', user=user,
                           w_stuffs=w_stuffs)

