package com.suclan.suclan.interceptor;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Slf4j
@Component
public class RequestBodyLoggingFilter extends OncePerRequestFilter {
  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {
    ContentCachingRequestWrapper wrapped = new ContentCachingRequestWrapper(request);
    try {
      chain.doFilter(wrapped, response);
    } finally {
      byte[] buf = wrapped.getContentAsByteArray();
      String ct = request.getContentType();
      String body = new String(buf, 0, Math.min(buf.length, 512), StandardCharsets.UTF_8);
      if (response.getStatus() != 200) {
        log.info("REQ {} {} ct={} body[0..512]={} RES_STATUS {}", request.getMethod(), request.getRequestURI(), ct, body, response.getStatus());
      }
    }
  }
}
