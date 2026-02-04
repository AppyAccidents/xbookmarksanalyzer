const { XBookmarkScanner } = require('./content-script.js');

describe('XBookmarkScanner', () => {
    let scanner;

    beforeEach(() => {
        document.body.innerHTML = `
      <article data-testid="tweet">
        <div role="group">
          <div>
            <span>Test User</span>
            <span>@testuser</span>
          </div>
        </div>
        <a href="https://x.com/testuser/status/123456789">Link</a>
        <div data-testid="tweetText">This is a test tweet</div>
        <time datetime="2023-01-01T12:00:00.000Z">Jan 1</time>
        <div data-testid="like">1.5K</div>
        <div data-testid="retweet">500</div>
        <div data-testid="reply">100</div>
      </article>
    `;

        // Mock chrome runtime
        chrome.runtime.sendMessage.mockResolvedValue({});

        scanner = new XBookmarkScanner();
    });

    test('should extract bookmarks from DOM', async () => {
        // We need to verify scanCurrentPage logic
        // Since scanCurrentPage calls document.querySelectorAll('article'), our mock DOM should work

        const result = await scanner.scanCurrentPage();
        expect(result.tweets).toHaveLength(1);

        const tweet = result.tweets[0];
        expect(tweet.text).toBe('This is a test tweet');
        expect(tweet.username).toBe('testuser');
        expect(tweet.likes).toBe('1500'); // 1.5K -> 1500
        expect(tweet.retweets).toBe('500');
    });
});
