import React, { Component } from 'react';
import { Board } from './Board';
import NavBar from './NavBar';
// import LeaderBoard from './LeaderBoard';
import { UserSession, Person } from 'blockstack';
import { appConfig, BEST_SCORE_FILENAME } from '../assets/constants';

class BoardView extends Component {
  constructor(props) {
    super(props);
    this.userSession = new UserSession({ appConfig });
    this.state = { ready: false, board: new Board(), score: 0, bestScore: 0 };
  }

  restartGame() {
    this.setState({ board: new Board(), score: 0 });
  }

  handleKeyDown(event) {
    if (this.state.board.hasWon()) {
      return;
    }
    if (event.keyCode >= 37 && event.keyCode <= 40) {
      event.preventDefault();
      var direction = event.keyCode - 37;
      this.setState({ board: this.state.board.move(direction), score: this.state.board.score });
    }
    if (this.state.board.hasLost()) this.onGameOver();
  }

  handleTouchStart(event) {
    if (this.state.board.hasWon()) {
      return;
    }
    if (event.touches.length !== 1) {
      return;
    }
    this.startX = event.touches[0].screenX;
    this.startY = event.touches[0].screenY;

    event.preventDefault();
  }

  handleTouchEnd(event) {
    if (this.state.board.hasWon()) {
      return;
    }
    if (event.changedTouches.length !== 1) {
      return;
    }
    var deltaX = event.changedTouches[0].screenX - this.startX;
    var deltaY = event.changedTouches[0].screenY - this.startY;
    var direction = -1;
    if (Math.abs(deltaX) > 3 * Math.abs(deltaY) && Math.abs(deltaX) > 30) {
      direction = deltaX > 0 ? 2 : 0;
    } else if (Math.abs(deltaY) > 3 * Math.abs(deltaX) && Math.abs(deltaY) > 30) {
      direction = deltaY > 0 ? 3 : 1;
    }

    if (direction !== -1) {
      this.setState({ board: this.state.board.move(direction), score: this.state.board.score });
    }
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.loadBestScore();
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }

  loadBestScore() {
    const options = { decrypt: false };
    this.userSession.getFile(BEST_SCORE_FILENAME, options).then(content => {
      this.setState({ ready: true });
      if (content) {
        const bestScore = JSON.parse(content);
        this.setState({ bestScore, redirectToMe: false });
      } else {
        const bestScore = 0;
        this.setState({ bestScore, redirectToMe: true });
      }
    });
  }

  saveBestScore() {
    const bestScore = this.state.bestScore;
    const options = { encrypt: false };
    this.userSession.putFile(BEST_SCORE_FILENAME, JSON.stringify(bestScore), options);
  }

  onGameOver() {
    if (this.state.score > this.state.bestScore) {
      this.setState({ bestScore: this.state.score });
      this.saveBestScore();
    }
  }

  render() {
    var cells = this.state.board.cells.map((row, rowIndex) => (
      <div key={rowIndex}>
        {row.map((_, columnIndex) => (
          <Cell key={rowIndex * Board.size + columnIndex} />
        ))}
      </div>
    ));
    var tiles = this.state.board.tiles
      .filter(tile => tile.value !== 0)
      .map(tile => <TileView tile={tile} key={tile.id} />);
    const username = this.props.userSession.loadUserData().username;
    const profile = this.props.userSession.loadUserData().profile;
    const user = new Person(profile);
    return (
      <div className="container-fluid">
        <div className="row">
          <NavBar username={username} user={user} signOut={this.props.handleSignOut} />
        </div>
        <div className="row">
          <div className="col">
            <div className="scores">
              <span className="best-score">score: {this.state.score}</span>
              <span className="score">best: {this.state.bestScore}</span>
            </div>
            <div
              className="board"
              onTouchStart={this.handleTouchStart.bind(this)}
              onTouchEnd={this.handleTouchEnd.bind(this)}
              tabIndex="1"
            >
              {cells}
              {tiles}
              <GameEndOverlay board={this.state.board} onRestart={this.restartGame.bind(this)} />
            </div>
          </div>
          <div className="col">
            {/* <LeaderBoard users={[{ account: 'kien', score: 10 }]} /> */}
          </div>
        </div>
      </div>
    );
  }
}

BoardView.defaultProps = {
  userSession: new UserSession(appConfig)
};

export default BoardView;

class Cell extends Component {
  shouldComponentUpdate() {
    return false;
  }
  render() {
    return <span className="cell">{''}</span>;
  }
}

class TileView extends Component {
  shouldComponentUpdate(nextProps) {
    if (this.props.tile !== nextProps.tile) {
      return true;
    }
    if (!nextProps.tile.hasMoved() && !nextProps.tile.isNew()) {
      return false;
    }
    return true;
  }
  render() {
    var tile = this.props.tile;
    var classArray = ['tile'];
    classArray.push('tile' + this.props.tile.value);
    if (!tile.mergedInto) {
      classArray.push('position_' + tile.row + '_' + tile.column);
    }
    if (tile.mergedInto) {
      classArray.push('merged');
    }
    if (tile.isNew()) {
      classArray.push('new');
    }
    if (tile.hasMoved()) {
      classArray.push('row_from_' + tile.fromRow() + '_to_' + tile.toRow());
      classArray.push('column_from_' + tile.fromColumn() + '_to_' + tile.toColumn());
      classArray.push('isMoving');
    }
    var classes = classArray.join(' ');
    return <span className={classes}>{tile.value}</span>;
  }
}

var GameEndOverlay = ({ board, onRestart }) => {
  var contents = '';
  if (board.hasWon()) {
    contents = 'Good Job!';
  } else if (board.hasLost()) {
    contents = 'Game Over';
  }
  if (!contents) {
    return null;
  }
  return (
    <div className="overlay">
      <p className="message">{contents}</p>
      <button className="tryAgain" onClick={onRestart} onTouchEnd={onRestart}>
        Try again
      </button>
    </div>
  );
};
