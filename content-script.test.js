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

    // Reset mocks
    jest.clearAllMocks();

    scanner = new XBookmarkScanner();
  });

  test('should extract bookmarks from DOM', async () => {
    const result = await scanner.scanCurrentPage();
    expect(result.tweets).toHaveLength(1);

    const tweet = result.tweets[0];
    expect(tweet.text).toBe('This is a test tweet');
    expect(tweet.username).toBe('testuser');
  });

  test('should parse intercepted API data', () => {
    const mockData = {
      user: {
        result: {
          timeline_v2: {
            timeline: {
              instructions: [
                {
                  type: "TimelineAddEntries",
                  entries: [
                    {
                      entryId: "tweet-123",
                      content: {
                        itemContent: {
                          tweet_results: {
                            result: {
                              legacy: {
                                id_str: "123456789",
                                full_text: "API Tweet Text",
                                created_at: "Wed Oct 10 20:19:24 +0000 2018",
                                favorite_count: 999,
                                retweet_count: 10,
                                reply_count: 5
                              },
                              core: {
                                user_results: {
                                  result: {
                                    legacy: {
                                      screen_name: "apitest",
                                      name: "API Test User"
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  ]
                }
              ]
            }
          }
        }
      }
    };

    scanner.processInterception(mockData);

    expect(scanner.interceptedTweets.size).toBe(1);
    const tweet = scanner.interceptedTweets.get('https://x.com/apitest/status/123456789');

    expect(tweet).toBeDefined();
    expect(tweet.text).toBe('API Tweet Text');
    expect(tweet.likes).toBe('999');
    expect(tweet.username).toBe('apitest');

    // Check if signal message was sent
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(expect.objectContaining({
      type: 'X_BOOKMARKS_LOADED',
      count: 1
    }));
  });

  test('should extract high-quality media from API', () => {
    const mockData = {
      entries: [{
        content: {
          itemContent: {
            tweet_results: {
              result: {
                legacy: {
                  id_str: "999",
                  full_text: "Media Tweet",
                  created_at: "Wed Oct 10 20:19:24 +0000 2018",
                  extended_entities: {
                    media: [
                      {
                        media_url_https: "http://img.com/thumb.jpg",
                        type: "video",
                        video_info: {
                          variants: [
                            { bitrate: 0, content_type: "application/x-mpegURL", url: "http://m3u8" },
                            { bitrate: 832000, content_type: "video/mp4", url: "http://video_low.mp4" },
                            { bitrate: 2176000, content_type: "video/mp4", url: "http://video_high.mp4" }
                          ]
                        }
                      }
                    ]
                  }
                },
                core: { user_results: { result: { legacy: { screen_name: "media_user", name: "User" } } } }
              }
            }
          }
        }
      }]
    };

    scanner.processInterception(mockData);
    const tweet = scanner.interceptedTweets.get('https://x.com/media_user/status/999');

    expect(tweet.media).toBeDefined();
    expect(tweet.media).toHaveLength(1);
    expect(tweet.media[0].type).toBe('video');
    expect(tweet.media[0].url).toBe('http://video_high.mp4'); // Should pick highest bitrate
  });
});
