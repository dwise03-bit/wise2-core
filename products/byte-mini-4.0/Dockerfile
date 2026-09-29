FROM espressif/idf:v5.3

WORKDIR /workspace

COPY firmware /workspace

RUN . /opt/esp/idf/export.sh && \
    idf.py set-target esp32c6 && \
    idf.py build

CMD ["bash", "-c", ". /opt/esp/idf/export.sh && idf.py flash monitor"]
