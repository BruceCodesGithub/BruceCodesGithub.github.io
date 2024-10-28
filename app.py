from flask import Flask, render_template, redirect, url_for, request
from flask_sqlalchemy import SQLAlchemy
from random import sample

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Song Model
class Song(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), unique=True, nullable=False)
    wins = db.Column(db.Integer, default=0)
    losses = db.Column(db.Integer, default=0)

    @property
    def win_percentage(self):
        total = self.wins + self.losses
        return (self.wins / total) * 100 if total > 0 else 0

# Initialize the database with some songs (run this only once)
def init_db():
    with app.app_context():
        db.create_all()
        # Example song entries, replace or expand this list
        songs = ["John Lennon vs Bill O'Reilly", "Darth Vader vs Hitler", "Abe Lincoln vs Chuck Norris", "Sarah Palin vs Lady Gaga"]
        for title in songs:
            if not Song.query.filter_by(title=title).first():
                db.session.add(Song(title=title))
        db.session.commit()

# Homepage Route
@app.route('/')
def index():
    # Get two random songs
    song1, song2 = sample(Song.query.all(), 2)
    return render_template('index.html', song1=song1, song2=song2)

@app.route('/vote/<int:song1_id>/<int:song2_id>/<int:choice>', methods=['GET', 'POST'])
def vote(song1_id, song2_id, choice):
    song1 = Song.query.get(song1_id)
    song2 = Song.query.get(song2_id)

    if choice == 1:
        song1.wins += 1
        song2.losses += 1
    elif choice == 2:
        song2.wins += 1
        song1.losses += 1

    db.session.commit()
    return redirect(url_for('index'))


# Results Page
@app.route('/results')
def results():
    songs = Song.query.all()  # Retrieve all songs
    # Sort by win_percentage in descending order
    sorted_songs = sorted(songs, key=lambda song: song.win_percentage, reverse=True)
    return render_template('results.html', songs=sorted_songs)


if __name__ == '__main__':
    init_db()  # Initialize database
    app.run(debug=True)
