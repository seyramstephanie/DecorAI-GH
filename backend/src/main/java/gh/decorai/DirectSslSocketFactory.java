package gh.decorai;

import java.io.IOException;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.Proxy;
import java.net.Socket;
import java.security.SecureRandom;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSocket;
import javax.net.ssl.SSLSocketFactory;

/** SSL sockets over Proxy.NO_PROXY for Gmail SMTPS (port 465). */
public final class DirectSslSocketFactory extends SSLSocketFactory {
  private static final DirectSslSocketFactory INSTANCE = new DirectSslSocketFactory();
  private static final int CONNECT_MS = 12_000;
  private final SSLSocketFactory delegate;

  private DirectSslSocketFactory() {
    try {
      SSLContext ctx = SSLContext.getInstance("TLS");
      ctx.init(null, null, new SecureRandom());
      this.delegate = ctx.getSocketFactory();
    } catch (Exception e) {
      throw new IllegalStateException("Cannot init SSL", e);
    }
  }

  public static DirectSslSocketFactory getDefault() {
    return INSTANCE;
  }

  private SSLSocket wrap(String host, int port) throws IOException {
    Socket plain = new Socket(Proxy.NO_PROXY);
    plain.connect(new InetSocketAddress(host, port), CONNECT_MS);
    SSLSocket ssl = (SSLSocket) delegate.createSocket(plain, host, port, true);
    ssl.startHandshake();
    return ssl;
  }

  @Override
  public Socket createSocket(Socket s, String host, int port, boolean autoClose) throws IOException {
    return delegate.createSocket(s, host, port, autoClose);
  }

  @Override
  public String[] getDefaultCipherSuites() {
    return delegate.getDefaultCipherSuites();
  }

  @Override
  public String[] getSupportedCipherSuites() {
    return delegate.getSupportedCipherSuites();
  }

  @Override
  public Socket createSocket(String host, int port) throws IOException {
    return wrap(host, port);
  }

  @Override
  public Socket createSocket(String host, int port, InetAddress localHost, int localPort) throws IOException {
    return wrap(host, port);
  }

  @Override
  public Socket createSocket(InetAddress host, int port) throws IOException {
    return wrap(host.getHostAddress(), port);
  }

  @Override
  public Socket createSocket(InetAddress address, int port, InetAddress localAddress, int localPort)
    throws IOException {
    return wrap(address.getHostAddress(), port);
  }
}
