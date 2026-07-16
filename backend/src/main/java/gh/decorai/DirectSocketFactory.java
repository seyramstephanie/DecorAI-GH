package gh.decorai;

import java.io.IOException;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.Proxy;
import java.net.Socket;
import javax.net.SocketFactory;

/**
 * Plain sockets that never use HTTP/SOCKS proxies.
 * Fixes Gmail SMTP "Connection refused" when the JVM inherits a broken proxy.
 */
public final class DirectSocketFactory extends SocketFactory {
  private static final DirectSocketFactory INSTANCE = new DirectSocketFactory();
  private static final int CONNECT_MS = 12_000;

  public static DirectSocketFactory getDefault() {
    return INSTANCE;
  }

  @Override
  public Socket createSocket() {
    return new Socket(Proxy.NO_PROXY);
  }

  @Override
  public Socket createSocket(String host, int port) throws IOException {
    Socket s = new Socket(Proxy.NO_PROXY);
    s.connect(new InetSocketAddress(host, port), CONNECT_MS);
    return s;
  }

  @Override
  public Socket createSocket(String host, int port, InetAddress localHost, int localPort) throws IOException {
    Socket s = new Socket(Proxy.NO_PROXY);
    s.bind(new InetSocketAddress(localHost, localPort));
    s.connect(new InetSocketAddress(host, port), CONNECT_MS);
    return s;
  }

  @Override
  public Socket createSocket(InetAddress host, int port) throws IOException {
    Socket s = new Socket(Proxy.NO_PROXY);
    s.connect(new InetSocketAddress(host, port), CONNECT_MS);
    return s;
  }

  @Override
  public Socket createSocket(InetAddress address, int port, InetAddress localAddress, int localPort)
    throws IOException {
    Socket s = new Socket(Proxy.NO_PROXY);
    s.bind(new InetSocketAddress(localAddress, localPort));
    s.connect(new InetSocketAddress(address, port), CONNECT_MS);
    return s;
  }
}
